"""
LMS (Learning Management System) models.

Defines the core data layer for Courses, Modules, Lessons, Media,
Enrollments, Live Classes and Attendance records.
"""

import re
from urllib.parse import parse_qs, urlparse

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Course(models.Model):
    """
    Represents a course offered on the platform.

    A course is the top-level container for educational content.
    It is composed of Modules, each of which contains Lessons.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, help_text="The public-facing title of the course.")
    description = models.TextField(blank=True, null=True, help_text="A detailed description of the course content.")
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00,
        help_text="Course cost in the default currency."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Module(models.Model):
    """
    A named section within a Course.

    Modules provide logical grouping of Lessons and have an explicit
    sort order within their parent course.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, related_name="modules", on_delete=models.CASCADE,
        db_index=True, help_text="The course this module belongs to."
    )
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0, help_text="Display order within the course (ascending).")

    class Meta:
        verbose_name = "Module"
        verbose_name_plural = "Modules"
        ordering = ["order"]
        indexes = [
            models.Index(fields=["course", "order"]),
        ]

    def __str__(self) -> str:
        return f"{self.course.title} – {self.title}"


class Lesson(models.Model):
    """
    An individual lesson within a Module.

    Each lesson can have multiple associated Media items (video, audio, notes).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    module = models.ForeignKey(
        Module, related_name="lessons", on_delete=models.CASCADE,
        db_index=True, help_text="The module this lesson belongs to."
    )
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0, help_text="Display order within the module (ascending).")

    class Meta:
        verbose_name = "Lesson"
        verbose_name_plural = "Lessons"
        ordering = ["order"]
        indexes = [
            models.Index(fields=["module", "order"]),
        ]

    def __str__(self) -> str:
        return f"{self.module.title} – {self.title}"


GOOGLE_DRIVE_HOSTS = {"drive.google.com", "docs.google.com"}
GOOGLE_DRIVE_FILE_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{10,}$")


def get_google_drive_file_id(url: str) -> str | None:
    """Return a Google Drive file ID from a supported sharing URL, if present."""
    if not url:
        return None

    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()
    if host not in GOOGLE_DRIVE_HOSTS:
        return None

    # Standard Drive links use /file/d/<file-id>/view. Google Docs links
    # use the same ``/d/<file-id>`` segment with a different path prefix.
    path_match = re.search(r"/d/([^/]+)", parsed.path)
    file_id = path_match.group(1) if path_match else parse_qs(parsed.query).get("id", [None])[0]

    return file_id if file_id and GOOGLE_DRIVE_FILE_ID_PATTERN.fullmatch(file_id) else None


def validate_google_drive_url(value: str) -> None:
    """Ensure a media link is a valid Google Drive sharing URL."""
    URLValidator()(value)
    if not get_google_drive_file_id(value):
        raise ValidationError(
            "Enter a Google Drive file sharing link, for example "
            "https://drive.google.com/file/d/FILE_ID/view."
        )


class Media(models.Model):
    """
    A media item (video, audio, or PDF notes) attached to a Lesson.

    New content is hosted in Google Drive and referenced by ``drive_url``;
    files are not uploaded through this application. ``file`` remains only as
    a temporary, read-only legacy fallback for content uploaded before this
    change, so existing lessons are not broken during migration.
    """

    MEDIA_TYPES = (
        ("video", "Video"),
        ("audio", "Audio"),
        ("notes", "Notes (PDF)"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lesson = models.ForeignKey(
        Lesson, related_name="media", on_delete=models.CASCADE,
        db_index=True, help_text="The lesson this media belongs to."
    )
    media_type = models.CharField(
        max_length=10, choices=MEDIA_TYPES,
        help_text="The type of media content."
    )
    drive_url = models.URLField(
        blank=True,
        null=True,
        validators=[validate_google_drive_url],
        help_text=(
            "Paste a Google Drive file sharing link. Set the file access to "
            "'Anyone with the link' so enrolled students can view it."
        ),
    )
    file = models.FileField(
        upload_to="lms_media/",
        blank=True,
        help_text="Legacy uploaded file. New media must use the Google Drive link above.",
    )
    title = models.CharField(max_length=255, blank=True, help_text="Optional display title for this media item.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Media"
        verbose_name_plural = "Media"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["lesson", "media_type"]),
        ]

    def __str__(self) -> str:
        return f"[{self.media_type}] {self.lesson.title}"

    def clean(self):
        super().clean()
        if not self.drive_url and not self.file:
            raise ValidationError({"drive_url": "A Google Drive sharing link is required."})

    @property
    def google_drive_file_id(self) -> str | None:
        """The Drive file ID used to build a browser-safe embed URL."""
        return get_google_drive_file_id(self.drive_url or "")

    @property
    def embed_url(self) -> str:
        """Drive preview URL suitable for an iframe in the student panel."""
        file_id = self.google_drive_file_id
        return f"https://drive.google.com/file/d/{file_id}/preview" if file_id else ""


class Enrollment(models.Model):
    """
    Records a student's enrollment in a Course.

    Tracks payment status and the student's last-watched lesson for
    progress restoration when they resume the course.
    """

    PAYMENT_STATUS_CHOICES = (
        ("unpaid", "Unpaid"),
        ("partial", "Partial"),
        ("paid", "Paid"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="enrollments",
        on_delete=models.CASCADE, db_index=True,
    )
    course = models.ForeignKey(
        Course, related_name="enrollments",
        on_delete=models.CASCADE, db_index=True,
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    # Payment tracking
    payment_status = models.CharField(
        max_length=15, choices=PAYMENT_STATUS_CHOICES, default="unpaid",
        db_index=True,
    )
    course_fee = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00,
        help_text="Agreed course fee for this student (may differ from the listed course price)."
    )
    payment_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00,
        help_text="Legacy: initial payment amount recorded at enrollment."
    )
    payment_date = models.DateTimeField(null=True, blank=True)

    # Progress tracking: the last lesson the student watched
    last_watched_lesson = models.ForeignKey(
        Lesson, null=True, blank=True, on_delete=models.SET_NULL,
        help_text="Most recent lesson the student has watched; used to restore progress."
    )

    class Meta:
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        ordering = ["-enrolled_at"]
        unique_together = ("user", "course")
        indexes = [
            models.Index(fields=["user", "course"]),
        ]

    def __str__(self) -> str:
        return f"{self.user.email} enrolled in {self.course.title}"

    @property
    def total_paid(self):
        """Sum of all PaymentRecords for this enrollment."""
        payments = self.payment_records.all()
        return sum(p.amount for p in payments)

    @property
    def balance_amount(self):
        """
        Balance owed = course_fee - total_paid.
        Falls back to ``course.price`` if ``course_fee`` is 0.
        """
        fee = self.course_fee if self.course_fee else self.course.price
        return max(fee - self.total_paid, 0)


class PaymentRecord(models.Model):
    """
    Manual fee tracking for student enrollments.
    """
    PAYMENT_METHOD_CHOICES = (
        ("upi", "UPI"),
        ("bank", "Bank Transfer"),
        ("cash", "Cash"),
        ("card", "Card"),
        ("other", "Other"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(
        Enrollment, related_name="payment_records", on_delete=models.CASCADE,
        db_index=True, help_text="The enrollment this payment is for."
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount paid.")
    payment_date = models.DateTimeField(default=timezone.now, db_index=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default="upi")
    reference_id = models.CharField(max_length=255, blank=True, help_text="Transaction ID or reference number.")
    remarks = models.TextField(blank=True, help_text="Any additional notes.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Payment Record"
        verbose_name_plural = "Payment Records"
        ordering = ["-payment_date"]
        indexes = [
            models.Index(fields=["enrollment", "payment_date"]),
        ]

    def __str__(self) -> str:
        return f"₹{self.amount} for {self.enrollment.user.email} on {self.payment_date.strftime('%d %b %Y')}"


class LiveClass(models.Model):
    """
    A scheduled live class session for a Course.

    Students enrolled in the parent course receive a reminder email
    when a new LiveClass is created (handled in lms/admin.py).
    """

    STATUS_CHOICES = (
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("postponed", "Postponed"),
        ("cancelled", "Cancelled"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, related_name="live_classes", on_delete=models.CASCADE, db_index=True,
    )
    title = models.CharField(max_length=255)
    scheduled_time = models.DateTimeField(db_index=True)
    zoom_link = models.URLField(max_length=500)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="scheduled", help_text="Current status of the live class.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Live Class"
        verbose_name_plural = "Live Classes"
        ordering = ["scheduled_time"]

    def __str__(self) -> str:
        return f"{self.title} – {self.scheduled_time:%d %b %Y %H:%M} ({self.get_status_display()})"


class LiveClassAttendance(models.Model):
    """
    Records whether a student was present or absent in a LiveClass.

    A student can have at most one attendance record per live class
    (enforced via ``unique_together``).
    """

    ATTENDANCE_CHOICES = (
        ("present", "Present"),
        ("absent", "Absent"),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    live_class = models.ForeignKey(
        LiveClass, related_name="attendances", on_delete=models.CASCADE, db_index=True,
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="live_class_attendances",
        on_delete=models.CASCADE, db_index=True,
    )
    status = models.CharField(max_length=10, choices=ATTENDANCE_CHOICES, default="absent")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Live Class Attendance"
        verbose_name_plural = "Live Class Attendances"
        unique_together = ("live_class", "student")
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"{self.student.email} – {self.live_class.title} ({self.get_status_display()})"
