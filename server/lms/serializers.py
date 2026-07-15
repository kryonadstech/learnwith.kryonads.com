from rest_framework import serializers
from .models import Course, Module, Lesson, Media, Enrollment, LiveClass
from users.models import User

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'media_type', 'file', 'title', 'created_at']

class LessonSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'media']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'order', 'lessons']

class CourseSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'modules']

class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'created_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    course_id = serializers.UUIDField(write_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'user_id', 'user_email', 'course', 'course_id', 'enrolled_at', 'last_watched_lesson']

class LiveClassSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = LiveClass
        fields = ['id', 'course', 'course_title', 'title', 'scheduled_time', 'zoom_link', 'created_at']

# Simple User Serializer for Admin
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_active', 'created_at']
