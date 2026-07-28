"""
LMS API views.

Provides ViewSets for admin and student-facing endpoints covering
Courses, Modules, Lessons, Media, Enrollments, Live Classes and Students.

All admin viewsets extend ``CachedListRetrieveMixin`` which:
  - Caches ``list`` and ``retrieve`` responses for 15 minutes.
  - Automatically invalidates stale cache entries on any write operation
    (create, update, delete).
  - Busts the admin dashboard stats cache so counts stay accurate.
"""

from django.core.cache import cache
from django.utils import timezone

from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from .models import Course, Module, Lesson, Media, Enrollment, LiveClass, PaymentRecord
from .serializers import (
    CourseSerializer,
    CourseListSerializer,
    ModuleSerializer,
    LessonSerializer,
    MediaSerializer,
    EnrollmentSerializer,
    LiveClassSerializer,
    StudentSerializer,
)
from users.models import User

# ── Cache TTL ────────────────────────────────────────────────────────────────
_CACHE_TTL = 60 * 15  # 15 minutes


# ── Custom permission ────────────────────────────────────────────────────────

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Allow safe (read-only) requests from any authenticated user.
    Write operations require ``is_staff=True``.
    """

    def has_permission(self, request, view) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_staff)


# ── Reusable cache mixin ─────────────────────────────────────────────────────

class CachedListRetrieveMixin:
    """
    Mixin that adds transparent caching to ModelViewSet list/retrieve actions.

    Subclasses must define a unique ``cache_prefix`` string so cache keys
    do not collide across different viewsets.

    Cache TTL defaults to 15 minutes (``_CACHE_TTL``). Override
    ``cache_ttl`` on the subclass to change it per-viewset.

    On any write (create, update, destroy) the mixin deletes the stale
    list entry and, where applicable, the specific object entry. It also
    busts both dashboard stats cache keys to keep admin counters accurate.
    """

    cache_prefix: str = "admin"
    cache_ttl: int = _CACHE_TTL

    # ── Key helpers ──────────────────────────────────────────────────────────

    def _list_cache_key(self) -> str:
        return f"{self.cache_prefix}_list"

    def _retrieve_cache_key(self, pk) -> str:
        return f"{self.cache_prefix}_retrieve_{pk}"

    def _invalidate(self, pk=None) -> None:
        """Delete cached list (and optionally a single object) then bust dashboard."""
        cache.delete(self._list_cache_key())
        if pk:
            cache.delete(self._retrieve_cache_key(pk))
        # Bust dashboard stats so totals reflect the mutation immediately
        cache.delete("admin_dashboard_stats_data")
        cache.delete("unfold_dashboard_stats")

    # ── Cached read actions ──────────────────────────────────────────────────

    def list(self, request, *args, **kwargs):
        """Return a cached list response, falling back to the DB on a miss."""
        key = self._list_cache_key()
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(key, response.data, self.cache_ttl)
        return response

    def retrieve(self, request, *args, **kwargs):
        """Return a cached object response, falling back to the DB on a miss."""
        key = self._retrieve_cache_key(kwargs.get("pk"))
        cached = cache.get(key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        cache.set(key, response.data, self.cache_ttl)
        return response

    # ── Write-through invalidation ───────────────────────────────────────────

    def perform_create(self, serializer) -> None:
        super().perform_create(serializer)
        self._invalidate()

    def perform_update(self, serializer) -> None:
        super().perform_update(serializer)
        self._invalidate(pk=serializer.instance.pk)

    def perform_destroy(self, instance) -> None:
        pk = instance.pk
        super().perform_destroy(instance)
        self._invalidate(pk=pk)


# ── Admin ViewSets ───────────────────────────────────────────────────────────

class AdminCourseViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """CRUD API for Courses. Admin only."""

    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_courses"


class AdminModuleViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """CRUD API for Modules. Admin only."""

    queryset = Module.objects.select_related("course")
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_modules"


class AdminLessonViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """CRUD API for Lessons. Admin only."""

    queryset = Lesson.objects.select_related("module__course")
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_lessons"


class AdminMediaViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """CRUD API for Media files. Admin only."""

    queryset = Media.objects.select_related("lesson__module__course")
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_media"


class AdminLiveClassViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """CRUD API for Live Classes. Admin only."""

    queryset = LiveClass.objects.select_related("course")
    serializer_class = LiveClassSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_live_classes"


class AdminEnrollmentViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """CRUD API for Enrollments. Admin only."""

    queryset = Enrollment.objects.prefetch_related("payment_records").select_related("user", "course")
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_enrollments"


class AdminStudentViewSet(CachedListRetrieveMixin, viewsets.ModelViewSet):
    """
    CRUD API for Student accounts. Admin only.

    Includes a custom ``reset_device`` action that invalidates the
    student's current auth token, effectively forcing a re-login on all
    their devices.
    """

    queryset = User.objects.filter(is_student=True)
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAdminUser]
    cache_prefix = "admin_students"

    @action(detail=True, methods=["post"])
    def reset_device(self, request, pk=None):
        """Delete the student's auth token to reset their device lock."""
        from rest_framework.authtoken.models import Token

        student = self.get_object()
        Token.objects.filter(user=student).delete()
        return Response({"status": "device lock reset successfully"})


# ── Student ViewSets ─────────────────────────────────────────────────────────

class StudentCourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API that returns the courses a student is enrolled in.

    Both ``list`` and ``retrieve`` responses are cached per user for
    15 minutes using a user-scoped cache key.
    """

    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only courses the requesting student is enrolled in."""
        enrolled_ids = (
            Enrollment.objects
            .filter(user=self.request.user)
            .values_list("course_id", flat=True)
        )
        return Course.objects.filter(id__in=enrolled_ids).prefetch_related(
            "modules__lessons__media", "enrollments__payment_records"
        )

    def list(self, request, *args, **kwargs):
        """Return a cached list of enrolled courses."""
        cache_key = f"student_{request.user.id}_courses_list"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, _CACHE_TTL)
        return response

    def retrieve(self, request, *args, **kwargs):
        """Return a single cached enrolled course."""
        cache_key = f"student_{request.user.id}_courses_retrieve_{kwargs.get('pk')}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, _CACHE_TTL)
        return response


class StudentLiveClassViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API that returns live classes for a student's enrolled courses.

    Responses are cached per user for 15 minutes.
    """

    serializer_class = LiveClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only live classes for courses the student is enrolled in."""
        enrolled_ids = (
            Enrollment.objects
            .filter(user=self.request.user)
            .values_list("course_id", flat=True)
        )
        return LiveClass.objects.filter(course_id__in=enrolled_ids).select_related("course")

    def list(self, request, *args, **kwargs):
        """Return a cached list of upcoming live classes."""
        cache_key = f"student_{request.user.id}_live_classes_list"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, _CACHE_TTL)
        return response

    def retrieve(self, request, *args, **kwargs):
        """Return a single cached live class."""
        cache_key = f"student_{request.user.id}_live_classes_retrieve_{kwargs.get('pk')}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, _CACHE_TTL)
        return response


class StudentEnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only API that returns the student's enrollments, including
    payment records, total paid, and balance.
    """

    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Return only the requesting student's enrollments."""
        return Enrollment.objects.filter(user=self.request.user).select_related("course").prefetch_related("payment_records")

    def list(self, request, *args, **kwargs):
        cache_key = f"student_{request.user.id}_enrollments_list"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, _CACHE_TTL)
        return response

    def retrieve(self, request, *args, **kwargs):
        cache_key = f"student_{request.user.id}_enrollments_retrieve_{kwargs.get('pk')}"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().retrieve(request, *args, **kwargs)
        cache.set(cache_key, response.data, _CACHE_TTL)
        return response


# ── Admin dashboard stats endpoint ───────────────────────────────────────────

@api_view(["GET"])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard_stats(request):
    """
    Return aggregated statistics for the admin dashboard.

    The response is cached for 15 minutes under the key
    ``admin_dashboard_stats_data``. The cache is busted automatically
    whenever any admin viewset performs a write operation.

    Response shape::

        {
            "stats": {
                "total_students": int,
                "total_courses": int,
                "total_enrollments": int,
                "total_instructors": int,
            },
            "graph": {"labels": [...], "data": [...]},
            "top_courses": [...],
            "recent_enrollments": [...],
            "latest_students": [...],
            "live_classes": [...],
            "storage": {"videos": int, "docs": int, "used_pct": int},
        }
    """
    cache_key = "admin_dashboard_stats_data"
    cached_data = cache.get(cache_key)
    if cached_data is not None:
        return Response(cached_data)

    # ── Aggregate stats ──────────────────────────────────────────────────────
    total_students = User.objects.filter(is_student=True).count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    total_instructors = User.objects.filter(is_staff=True, is_student=False).count()

    # ── Lessons per course (for bar chart) ──────────────────────────────────
    courses = Course.objects.prefetch_related("modules__lessons", "enrollments").all()
    graph_labels = []
    graph_data = []
    top_courses = []

    for course in courses:
        lesson_count = sum(module.lessons.count() for module in course.modules.all())
        enroll_count = course.enrollments.count()
        graph_labels.append(course.title)
        graph_data.append(lesson_count)
        top_courses.append({"title": course.title, "enrollments": enroll_count})

    top_courses.sort(key=lambda x: x["enrollments"], reverse=True)

    # ── Recent enrollments ───────────────────────────────────────────────────
    recent_enrollments = [
        {
            "student": e.user.email,
            "course": e.course.title,
            "date": e.enrolled_at.strftime("%d %b %Y"),
        }
        for e in Enrollment.objects.select_related("user", "course").order_by("-enrolled_at")[:5]
    ]

    # ── Latest students ──────────────────────────────────────────────────────
    latest_students = [
        {
            "email": u.email,
            "date": u.created_at.strftime("%d %b %Y"),
            "is_active": u.is_active,
        }
        for u in User.objects.filter(is_student=True).order_by("-created_at")[:5]
    ]

    # ── Upcoming live classes ────────────────────────────────────────────────
    live_classes = [
        {
            "title": lc.title,
            "course": lc.course.title,
            "time": lc.scheduled_time.strftime("%d %b, %H:%M"),
        }
        for lc in LiveClass.objects.select_related("course")
        .filter(scheduled_time__gte=timezone.now())
        .order_by("scheduled_time")[:5]
    ]

    # ── Media breakdown ──────────────────────────────────────────────────────
    video_count = Media.objects.filter(media_type="video").count()
    doc_count = Media.objects.exclude(media_type="video").count()

    # ── Revenue tracking ──────────────────────────────────────────────────────
    from django.db.models import Sum
    now = timezone.now()
    
    total_revenue_ag = PaymentRecord.objects.aggregate(t=Sum("amount"))
    total_revenue = total_revenue_ag["t"] or 0

    monthly_revenue_ag = PaymentRecord.objects.filter(
        payment_date__year=now.year, payment_date__month=now.month
    ).aggregate(t=Sum("amount"))
    monthly_revenue = monthly_revenue_ag["t"] or 0

    pending_revenue = 0
    # Sum of balances across all enrollments
    for enr in Enrollment.objects.select_related('course').prefetch_related('payment_records').all():
        pending_revenue += enr.balance_amount

    data = {
        "stats": {
            "total_students": total_students,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "total_instructors": total_instructors,
            "total_revenue": total_revenue,
            "monthly_revenue": monthly_revenue,
            "pending_revenue": pending_revenue,
        },
        "graph": {
            "labels": graph_labels,
            "data": graph_data,
        },
        "top_courses": top_courses[:5],
        "recent_enrollments": recent_enrollments,
        "latest_students": latest_students,
        "live_classes": live_classes,
        "storage": {
            "videos": video_count,
            "docs": doc_count,
            "used_pct": min((video_count + doc_count) * 5, 90),
        },
    }

    cache.set(cache_key, data, _CACHE_TTL)
    return Response(data)
