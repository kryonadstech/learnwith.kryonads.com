"""
User-facing API views for the Kryon LMS.

Endpoints:
    POST /auth/admin/login/       → AdminLoginView
    POST /auth/student/request-otp/ → RequestOTPView
    POST /auth/student/verify-otp/  → VerifyOTPView
    GET  /auth/me/                → MeView
    PUT  /auth/profile/update/    → UpdateProfileView
    POST /auth/logout/            → LogoutView
    POST /inquiry/                → InquiryCreateView
"""

import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework import permissions, status, views
from rest_framework.authtoken.models import Token
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Inquiry, OTP, User


# ── Helpers ──────────────────────────────────────────────────────────────────

def get_user_data(user: User, request=None) -> dict:
    """
    Build a safe serializable dict of user profile data.

    Args:
        user:    The ``User`` instance to serialize.
        request: Optional DRF request used to build the absolute photo URL.

    Returns:
        A plain dict suitable for use in a DRF ``Response``.
    """
    photo_url = None
    if user.profile_photo:
        photo_url = user.profile_photo.url
        if request:
            photo_url = request.build_absolute_uri(photo_url)

    return {
        "email": user.email,
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "address": user.address,
        "profile_photo": photo_url,
        "is_staff": user.is_staff,
        "is_student": user.is_student,
    }


def enforce_single_device(user: User) -> str:
    """
    Invalidate all existing auth tokens for *user* and issue a fresh one.

    This implements a single-active-session policy: only the most
    recently issued token is valid at any time.

    Args:
        user: The ``User`` whose token should be rotated.

    Returns:
        The newly created token key string.
    """
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)
    return token.key


# ── Auth Views ───────────────────────────────────────────────────────────────

class AdminLoginView(views.APIView):
    """
    Authenticate a staff user with email + password.

    Returns a DRF auth token and the user profile on success.
    The old token is deleted and a new one is issued on every login
    to enforce the single-device policy.
    """

    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)

        if user and user.is_staff:
            token_key = enforce_single_device(user)
            return Response({"token": token_key, "user": get_user_data(user, request)})

        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class RequestOTPView(views.APIView):
    """
    Generate and email a one-time password to a student.

    Any previously un-used OTP for this user is invalidated before a
    new one is created. The OTP expires in 10 minutes.
    """

    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email, is_student=True, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"error": "No active student account found with this email."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Invalidate all previous unused OTPs
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)

        code = str(random.randint(100000, 999999))
        OTP.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        try:
            send_mail(
                "Your LMS Login Code",
                f"Your login code is: {code}. It expires in 10 minutes.",
                settings.EMAIL_HOST_USER,
                [email],
                fail_silently=False,
            )
        except Exception:
            return Response(
                {"error": "Failed to send email. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"message": "OTP sent successfully"})


class VerifyOTPView(views.APIView):
    """
    Verify an OTP and return an auth token for the student.

    On success the OTP is marked as used and the student's auth token
    is rotated (single-device policy).
    """

    permission_classes = []

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("code")

        if not email or not code:
            return Response(
                {"error": "Email and code are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email, is_student=True, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid user"},
                status=status.HTTP_404_NOT_FOUND,
            )

        try:
            otp = OTP.objects.get(user=user, code=code, is_used=False)
        except OTP.DoesNotExist:
            return Response(
                {"error": "Invalid or expired code"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not otp.is_valid():
            return Response(
                {"error": "Code has expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_used = True
        otp.save(update_fields=["is_used"])

        token_key = enforce_single_device(user)
        return Response({"token": token_key, "user": get_user_data(user, request)})


# ── Profile Views ─────────────────────────────────────────────────────────────

class MeView(views.APIView):
    """
    Return the profile of the currently authenticated user.

    The response is cached per user for 15 minutes. The cache entry is
    invalidated automatically in ``UpdateProfileView`` whenever the
    profile is changed.
    """

    def get(self, request):
        cache_key = f"me_view_{request.user.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        data = get_user_data(request.user, request)
        cache.set(cache_key, data, 60 * 15)
        return Response(data)


class UpdateProfileView(views.APIView):
    """
    Update the profile of the currently authenticated user.

    Accepts multipart/form-data so that a profile photo can be uploaded
    alongside the text fields. Invalidates the ``MeView`` cache on save.
    """

    parser_classes = (MultiPartParser, FormParser)

    def put(self, request):
        user = request.user
        user.full_name = request.data.get("full_name", user.full_name)
        user.phone_number = request.data.get("phone_number", user.phone_number)
        user.address = request.data.get("address", user.address)

        if "profile_photo" in request.FILES:
            user.profile_photo = request.FILES["profile_photo"]

        user.save()

        # Bust the MeView cache so the next GET returns fresh data
        cache.delete(f"me_view_{user.id}")

        return Response(get_user_data(user, request))


class LogoutView(views.APIView):
    """
    Log out the currently authenticated user by deleting their auth token.

    The client should discard the token on its side after calling this endpoint.
    """

    def post(self, request):
        if request.auth:
            request.auth.delete()
        return Response({"message": "Logged out successfully"})


# ── Inquiry View ──────────────────────────────────────────────────────────────

class InquiryCreateView(views.APIView):
    """
    Accept a course-interest inquiry from a prospective student.

    Public POST requests create a new inquiry. Authenticated GET requests
    return inquiries submitted by the current signed-in user.
    """

    permission_classes = []

    def get(self, request):
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication credentials were not provided."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        inquiries = Inquiry.objects.filter(email=request.user.email).order_by('-created_at')
        data = [
            {
                'id': inquiry.id,
                'name': inquiry.name,
                'email': inquiry.email,
                'phone_number': inquiry.phone_number,
                'course_interest': inquiry.course_interest,
                'message': inquiry.message,
                'is_resolved': inquiry.is_resolved,
                'created_at': inquiry.created_at.strftime('%d %b %Y %H:%M'),
            }
            for inquiry in inquiries
        ]
        return Response(data)

    def post(self, request):
        name = request.data.get("name")
        email = request.data.get("email")

        if not name or not email:
            return Response(
                {"error": "Name and Email are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inquiry = Inquiry.objects.create(
            name=name,
            email=email,
            phone_number=request.data.get("phone_number", ""),
            course_interest=request.data.get("course_interest", ""),
            message=request.data.get("message", ""),
        )

        return Response(
            {"message": "Inquiry submitted successfully", "id": inquiry.id},
            status=status.HTTP_201_CREATED,
        )
