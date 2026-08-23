"""
DRF serializers for the LMS application.

Each serializer maps a model to the JSON representation used by the
REST API. Nested serializers are read-only to keep writes simple —
create/update operations use plain FK IDs.
"""

from rest_framework import serializers
from .models import (
    Course, Module, Lesson, Media, Enrollment, LiveClass, PaymentRecord,
    validate_google_drive_url,
)
from users.models import User


class MediaSerializer(serializers.ModelSerializer):
    """Serializes a Google Drive media item attached to a Lesson."""

    # Keep this explicit: new content created through the API must use Drive,
    # while legacy uploaded records can still be returned to students.
    drive_url = serializers.URLField(required=True, validators=[validate_google_drive_url])
    embed_url = serializers.CharField(read_only=True)
    legacy_file_url = serializers.SerializerMethodField(read_only=True)

    def get_legacy_file_url(self, obj):
        """Provide old locally uploaded content until each item is migrated."""
        if not obj.file:
            return ""
        request = self.context.get("request")
        url = obj.file.url
        return request.build_absolute_uri(url) if request else url

    class Meta:
        model = Media
        fields = [
            "id", "lesson", "media_type", "drive_url", "embed_url",
            "legacy_file_url", "title", "created_at",
        ]


class LessonSerializer(serializers.ModelSerializer):
    """Serializes a Lesson together with its nested Media items."""

    media = MediaSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ["id", "title", "order", "media"]


class ModuleSerializer(serializers.ModelSerializer):
    """Serializes a Module together with its nested Lessons."""

    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ["id", "title", "order", "lessons"]


class CourseSerializer(serializers.ModelSerializer):
    """
    Full Course serializer with nested Modules → Lessons → Media.

    Used for the student course detail view and admin course detail endpoint.
    """

    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ["id", "title", "description", "price", "created_at", "updated_at", "modules"]


class CourseListSerializer(serializers.ModelSerializer):
    """
    Lightweight Course serializer for list views.

    Omits the nested module tree to keep list responses small.
    """

    class Meta:
        model = Course
        fields = ["id", "title", "description", "price", "created_at"]


class PaymentRecordSerializer(serializers.ModelSerializer):
    """Serializes a Payment Record."""
    class Meta:
        model = PaymentRecord
        fields = ["id", "amount", "payment_date", "payment_method", "reference_id", "remarks"]


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializes an Enrollment with nested course summary and user email.

    ``course_id`` and ``user_id`` are write-only so that creates/updates
    only require the raw UUIDs; the nested read-only fields supply the
    enriched response representation.
    """

    course = CourseListSerializer(read_only=True)
    course_id = serializers.UUIDField(write_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    total_paid = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    balance_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    payment_records = PaymentRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id", "user_id", "user_email", "user_full_name",
            "course", "course_id",
            "enrolled_at", "payment_status",
            "course_fee", "payment_amount", "payment_date",
            "total_paid", "balance_amount", "payment_records",
            "last_watched_lesson",
        ]


class LiveClassSerializer(serializers.ModelSerializer):
    """Serializes a LiveClass with its parent course title for convenience."""

    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = LiveClass
        fields = ["id", "course", "course_title", "title", "scheduled_time", "zoom_link", "created_at"]


class StudentSerializer(serializers.ModelSerializer):
    """Lightweight serializer for student records used in the Admin API."""

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone_number", "is_active", "created_at"]
