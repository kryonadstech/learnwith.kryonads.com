from django.contrib import admin
from .models import Course, Module, Lesson, Media, Enrollment, LiveClass


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_at', 'updated_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    ordering = ['course', 'order']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'module', 'order']
    list_filter = ['module__course']
    search_fields = ['title', 'module__title']
    ordering = ['module', 'order']


@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson', 'media_type', 'created_at']
    list_filter = ['media_type']
    search_fields = ['title', 'lesson__title']
    ordering = ['-created_at']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'enrolled_at', 'last_watched_lesson']
    list_filter = ['course']
    search_fields = ['user__email', 'course__title']
    ordering = ['-enrolled_at']


@admin.register(LiveClass)
class LiveClassAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'scheduled_time', 'zoom_link']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    ordering = ['scheduled_time']
