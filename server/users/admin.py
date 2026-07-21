from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from .models import User, OTP, Student, Staff


# We keep the base admin class but do not register User directly
# so that it splits into Student and Staff below.
class UserAdmin(ModelAdmin, BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    change_password_form = AdminPasswordChangeForm

    list_display = ['email', 'full_name', 'is_student', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_student', 'is_staff', 'is_active']
    search_fields = ['email', 'full_name', 'phone_number']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'active_device_id']
    compressed_fields = True
    warn_unsaved_form = True

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Profile Details', {'fields': ('full_name', 'phone_number', 'address', 'profile_photo')}),
        ('Roles', {'fields': ('is_student', 'is_staff', 'is_superuser', 'is_active')}),
        ('Device Lock', {'fields': ('active_device_id',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'full_name', 'is_student', 'is_staff', 'is_active'),
        }),
    )

    # Override because we use email, not username
    filter_horizontal = []


@admin.register(OTP)
class OTPAdmin(ModelAdmin):
    list_display = ['user', 'code', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used']
    search_fields = ['user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    compressed_fields = True

@admin.register(Student)
class StudentAdmin(UserAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_student=True)

@admin.register(Staff)
class StaffAdmin(UserAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_staff=True)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Profile Details', {'fields': ('full_name', 'phone_number', 'address', 'profile_photo')}),
        ('Roles & Permissions', {'fields': ('is_student', 'is_staff', 'is_superuser', 'groups', 'is_active')}),
        ('Device Lock', {'fields': ('active_device_id',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    filter_horizontal = ['groups', 'user_permissions']

admin.site.unregister(Group)

@admin.register(Group)
class GroupAdmin(ModelAdmin, BaseGroupAdmin):
    pass
