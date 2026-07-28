"""
User-related models for the Kryonads LMS.

Provides a custom User model based on email authentication,
proxy models for Student and Staff views in the admin,
an OTP model for passwordless student login,
and an Inquiry model for prospective-student contact requests.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid


class UserManager(BaseUserManager):
    """Custom manager for the email-based User model."""

    def create_user(self, email: str, password: str | None = None, **extra_fields) -> "User":
        """
        Create and return a regular user with the given email and password.

        If no password is provided the account is created with an unusable
        password, which is correct for OTP-only student accounts.
        """
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str | None = None, **extra_fields) -> "User":
        """Create and return a superuser (staff + superuser, not a student)."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_student", False)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model using email as the unique identifier.

    Replaces Django's default username-based model so that both
    students (OTP login) and staff (password login) share the same
    table, differentiated by the ``is_student`` / ``is_staff`` flags.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)

    is_active = models.BooleanField(default=True, db_index=True)
    is_staff = models.BooleanField(default=False, db_index=True)
    is_student = models.BooleanField(default=True, db_index=True)

    # Profile details
    full_name = models.CharField(max_length=150, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    profile_photo = models.ImageField(upload_to="profile_photos/", null=True, blank=True)

    # Single-device lock — stores the last-issued device token
    active_device_id = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> str:
        return self.full_name or self.email

    def get_full_name(self) -> str:
        """Return the full name, or email as fallback."""
        return self.full_name or self.email

    def get_short_name(self) -> str:
        """Return the first word of the full name, or the email username prefix."""
        if self.full_name:
            return self.full_name.split()[0]
        return self.email.split("@")[0]


class Student(User):
    """
    Proxy model for student users.

    Filters the admin changelist to only show accounts where
    ``is_student=True``. No additional database columns are added.
    """

    class Meta:
        proxy = True
        verbose_name = "Student"
        verbose_name_plural = "Students"


class Staff(User):
    """
    Proxy model for staff users.

    Filters the admin changelist to only show accounts where
    ``is_staff=True``. No additional database columns are added.
    """

    class Meta:
        proxy = True
        verbose_name = "Staff Member"
        verbose_name_plural = "Staff Members"


class OTP(models.Model):
    """
    A one-time password (OTP) for passwordless student login.

    A fresh 6-digit code is generated on each login request and stored
    here with an expiry timestamp. Once used or expired the record is
    marked ``is_used=True`` and will not be accepted again.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps", db_index=True)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name = "OTP"
        verbose_name_plural = "OTPs"
        ordering = ["-created_at"]

    def is_valid(self) -> bool:
        """Return ``True`` if the OTP has not been used and has not expired."""
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.expires_at

    def __str__(self) -> str:
        return f"{self.user.email} – {self.code}"


class Inquiry(models.Model):
    """
    A contact / course-interest inquiry from a prospective student.

    Submitted via the public-facing contact form and managed by admin
    staff through the Django admin interface.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(db_index=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    course_interest = models.CharField(max_length=255, null=True, blank=True)
    message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False, db_index=True)

    class Meta:
        verbose_name = "Student Inquiry"
        verbose_name_plural = "Student Inquiries"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Inquiry from {self.name} ({self.email})"
