from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminCourseViewSet, AdminModuleViewSet, AdminLessonViewSet, AdminMediaViewSet,
    AdminEnrollmentViewSet, AdminLiveClassViewSet, AdminStudentViewSet,
    StudentCourseViewSet, StudentLiveClassViewSet
)

router = DefaultRouter()
# Admin routes
router.register(r'admin/courses', AdminCourseViewSet, basename='admin-course')
router.register(r'admin/modules', AdminModuleViewSet, basename='admin-module')
router.register(r'admin/lessons', AdminLessonViewSet, basename='admin-lesson')
router.register(r'admin/media', AdminMediaViewSet, basename='admin-media')
router.register(r'admin/enrollments', AdminEnrollmentViewSet, basename='admin-enrollment')
router.register(r'admin/live-classes', AdminLiveClassViewSet, basename='admin-live-class')
router.register(r'admin/students', AdminStudentViewSet, basename='admin-student')

# Student routes
router.register(r'student/courses', StudentCourseViewSet, basename='student-course')
router.register(r'student/live-classes', StudentLiveClassViewSet, basename='student-live-class')

from .views import admin_dashboard_stats

urlpatterns = [
    path('', include(router.urls)),
    path('admin/dashboard/stats/', admin_dashboard_stats, name='admin-dashboard-stats'),
]
