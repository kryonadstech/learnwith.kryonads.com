from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin, GroupAdmin as BaseGroupAdmin
from django.contrib.auth.models import Group
from unfold.admin import ModelAdmin
from unfold.forms import AdminPasswordChangeForm, UserChangeForm, UserCreationForm
from .models import User, OTP, Student, Staff, Inquiry
from utils.exports import export_to_excel, export_to_pdf


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

from unfold.admin import TabularInline
from lms.models import Enrollment

class EnrollmentInline(TabularInline):
    model = Enrollment
    extra = 0  # No blank rows — prevents accidental duplicate enrollments
    fields = ('course', 'enrolled_at', 'last_watched_lesson')
    readonly_fields = ('enrolled_at', 'last_watched_lesson')
    autocomplete_fields = ['course']
    show_change_link = True

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'course')

# ── Student export actions ───────────────────────────────────────────────────

STUDENT_FIELDS = [
    ('Full Name',    lambda obj: obj.full_name or ''),
    ('Email',        lambda obj: obj.email),
    ('Phone',        lambda obj: obj.phone_number or ''),
    ('Address',      lambda obj: obj.address or ''),
    ('Active',       lambda obj: 'Yes' if obj.is_active else 'No'),
    ('Date Joined',  lambda obj: obj.created_at),
]


def export_students_excel(modeladmin, request, queryset):
    return export_to_excel(queryset, STUDENT_FIELDS, filename='students')
export_students_excel.short_description = '⬇ Export selected Students as Excel (.xlsx)'


def export_students_pdf(modeladmin, request, queryset):
    return export_to_pdf(queryset, STUDENT_FIELDS, filename='students', title='Students Report')
export_students_pdf.short_description = '⬇ Export selected Students as PDF'


@admin.register(Student)
class StudentAdmin(UserAdmin):
    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_student=True)

    inlines = [EnrollmentInline]
    actions = [export_students_excel, export_students_pdf]

# ── Staff export actions ─────────────────────────────────────────────────────

STAFF_FIELDS = [
    ('Full Name',     lambda obj: obj.full_name or ''),
    ('Email',         lambda obj: obj.email),
    ('Phone',         lambda obj: obj.phone_number or ''),
    ('Superuser',     lambda obj: 'Yes' if obj.is_superuser else 'No'),
    ('Active',        lambda obj: 'Yes' if obj.is_active else 'No'),
    ('Date Joined',   lambda obj: obj.created_at),
]


def export_staff_excel(modeladmin, request, queryset):
    return export_to_excel(queryset, STAFF_FIELDS, filename='staff')
export_staff_excel.short_description = '⬇ Export selected Staff as Excel (.xlsx)'


def export_staff_pdf(modeladmin, request, queryset):
    return export_to_pdf(queryset, STAFF_FIELDS, filename='staff', title='Staff Report')
export_staff_pdf.short_description = '⬇ Export selected Staff as PDF'


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
    actions = [export_staff_excel, export_staff_pdf]

admin.site.unregister(Group)

@admin.register(Group)
class GroupAdmin(ModelAdmin, BaseGroupAdmin):
    pass

@admin.register(Inquiry)
class InquiryAdmin(ModelAdmin):
    list_display = ['name', 'email', 'course_interest', 'created_at', 'is_resolved']
    list_filter = ['is_resolved', 'course_interest']
    search_fields = ['name', 'email', 'phone_number', 'course_interest']
    ordering = ['-created_at']
    readonly_fields = ['created_at']
    compressed_fields = True
