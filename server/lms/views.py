from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
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
