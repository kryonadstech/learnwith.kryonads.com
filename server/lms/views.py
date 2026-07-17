from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Course, Module, Lesson, Media, Enrollment, LiveClass
from .serializers import (
    CourseSerializer, CourseListSerializer, ModuleSerializer, LessonSerializer,
    MediaSerializer, EnrollmentSerializer, LiveClassSerializer, StudentSerializer
)
from users.models import User

class IsAdminUserOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_staff

class AdminCourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminLessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminMediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminLiveClassViewSet(viewsets.ModelViewSet):
    queryset = LiveClass.objects.all()
    serializer_class = LiveClassSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminStudentViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_student=True)
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=True, methods=['post'])
    def reset_device(self, request, pk=None):
        student = self.get_object()
        from rest_framework.authtoken.models import Token
        Token.objects.filter(user=student).delete()
        return Response({'status': 'device lock reset successfully'})

# Student Views
class StudentCourseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return courses the student is enrolled in
        enrolled_course_ids = Enrollment.objects.filter(user=self.request.user).values_list('course_id', flat=True)
        return Course.objects.filter(id__in=enrolled_course_ids)

class StudentLiveClassViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LiveClassSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return live classes for courses the student is enrolled in
        enrolled_course_ids = Enrollment.objects.filter(user=self.request.user).values_list('course_id', flat=True)
        return LiveClass.objects.filter(course_id__in=enrolled_course_ids)

# Admin Custom Dashboard Stats View
@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_dashboard_stats(request):
    from rest_framework.authtoken.models import Token
    from django.db.models import Count

    total_students = User.objects.filter(is_student=True).count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    total_instructors = User.objects.filter(is_staff=True, is_student=False).count()

    # Graph: lessons per course
    courses = Course.objects.prefetch_related('modules__lessons').all()
    graph_labels = []
    graph_data = []
    top_courses = []

    for course in courses:
        lesson_count = sum(module.lessons.count() for module in course.modules.all())
        enroll_count = Enrollment.objects.filter(course=course).count()
        graph_labels.append(course.title)
        graph_data.append(lesson_count)
        top_courses.append({'title': course.title, 'enrollments': enroll_count})

    # Sort top courses by enrollments desc
    top_courses.sort(key=lambda x: x['enrollments'], reverse=True)

    # Recent enrollments (last 5)
    recent_enrollments = []
    for e in Enrollment.objects.select_related('user', 'course').order_by('-enrolled_at')[:5]:
        recent_enrollments.append({
            'student': e.user.email,
            'course': e.course.title,
            'date': e.enrolled_at.strftime('%d %b %Y') if hasattr(e, 'enrolled_at') else '—'
        })

    # Latest students (last 5)
    latest_students = []
    for u in User.objects.filter(is_student=True).order_by('-created_at')[:5]:
        latest_students.append({
            'email': u.email,
            'date': u.created_at.strftime('%d %b %Y') if hasattr(u, 'created_at') else '—',
            'is_active': u.is_active
        })

    # Upcoming live classes (next 5)
    from django.utils import timezone
    live_classes = []
    for lc in LiveClass.objects.select_related('course').filter(
        scheduled_time__gte=timezone.now()
    ).order_by('scheduled_time')[:5]:
        live_classes.append({
            'title': lc.title,
            'course': lc.course.title,
            'time': lc.scheduled_time.strftime('%d %b, %H:%M')
        })

    # Storage breakdown by media type
    video_count = Media.objects.filter(media_type='video').count()
    doc_count = Media.objects.exclude(media_type='video').count()

    return Response({
        'stats': {
            'total_students': total_students,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_instructors': total_instructors,
        },
        'graph': {
            'labels': graph_labels,
            'data': graph_data
        },
        'top_courses': top_courses[:5],
        'recent_enrollments': recent_enrollments,
        'latest_students': latest_students,
        'live_classes': live_classes,
        'storage': {
            'videos': video_count,
            'docs': doc_count,
            'used_pct': min((video_count + doc_count) * 5, 90),
        }
    })

