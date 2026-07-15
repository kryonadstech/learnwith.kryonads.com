from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'is_student', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_student', 'is_staff', 'is_active']
    search_fields = ['email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'active_device_id']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Roles', {'fields': ('is_student', 'is_staff', 'is_superuser', 'is_active')}),
        ('Device Lock', {'fields': ('active_device_id',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'is_student', 'is_staff', 'is_active'),
        }),
    )

    # Override because we use email, not username
    filter_horizontal = []


@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used']
    search_fields = ['user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
