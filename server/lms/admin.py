from django.contrib import admin
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from unfold.admin import ModelAdmin
from .models import Course, Module, Lesson, Media, Enrollment, LiveClass, LiveClassAttendance, PaymentRecord
from utils.exports import export_to_excel, export_to_pdf

from unfold.admin import TabularInline

class EnrollmentInline(TabularInline):
    model = Enrollment
    extra = 0  # No blank rows — prevents accidental duplicate enrollments
    fields = ('user', 'enrolled_at', 'last_watched_lesson')
    readonly_fields = ('enrolled_at', 'last_watched_lesson')
    raw_id_fields = ['user']
    show_change_link = True

    def get_queryset(self, request):
        # Ensure we only show distinct enrollments (user+course unique)
        return super().get_queryset(request).select_related('user', 'course')

class PaymentRecordInline(TabularInline):
    model = PaymentRecord
    extra = 1
    fields = ('amount', 'payment_date', 'payment_method', 'reference_id', 'remarks')
    show_change_link = True

@admin.register(Course)
class CourseAdmin(ModelAdmin):
    list_display = ['title', 'price', 'created_at', 'updated_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    compressed_fields = True
    warn_unsaved_form = True
    show_full_result_count = False
    inlines = [EnrollmentInline]


@admin.register(Module)
class ModuleAdmin(ModelAdmin):
    list_display = ['title', 'course', 'order']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    ordering = ['course', 'order']
    compressed_fields = True
    show_full_result_count = False


@admin.register(Lesson)
class LessonAdmin(ModelAdmin):
    list_display = ['title', 'module', 'order']
    list_filter = ['module__course']
    search_fields = ['title', 'module__title']
    ordering = ['module', 'order']
    compressed_fields = True
    show_full_result_count = False


@admin.register(Media)
class MediaAdmin(ModelAdmin):
    list_display = ['title', 'lesson', 'media_type', 'media_source', 'created_at']
    list_filter = ['media_type']
    search_fields = ['title', 'lesson__title']
    ordering = ['-created_at']
    compressed_fields = True
    show_full_result_count = False
    fields = ['lesson', 'title', 'media_type', 'drive_url']

    @admin.display(description='Source')
    def media_source(self, obj):
        return 'Google Drive' if obj.drive_url else 'Legacy upload'


# ── Enrollment export actions ────────────────────────────────────────────────

ENROLLMENT_FIELDS = [
    ('Student Email',       lambda obj: obj.user.email),
    ('Student Name',        lambda obj: obj.user.full_name or ''),
    ('Phone',               lambda obj: obj.user.phone_number or ''),
    ('Course',              lambda obj: obj.course.title),
    ('Enrolled At',         lambda obj: obj.enrolled_at),
    ('Last Watched Lesson', lambda obj: obj.last_watched_lesson.title if obj.last_watched_lesson else 'Not started'),
]


def export_enrollments_excel(modeladmin, request, queryset):
    qs = queryset.select_related('user', 'course', 'last_watched_lesson')
    return export_to_excel(qs, ENROLLMENT_FIELDS, filename='enrollments')
export_enrollments_excel.short_description = '⬇ Export selected Enrollments as Excel (.xlsx)'


def export_enrollments_pdf(modeladmin, request, queryset):
    qs = queryset.select_related('user', 'course', 'last_watched_lesson')
    return export_to_pdf(qs, ENROLLMENT_FIELDS, filename='enrollments', title='Enrollment Report')
export_enrollments_pdf.short_description = '⬇ Export selected Enrollments as PDF'


@admin.register(Enrollment)
class EnrollmentAdmin(ModelAdmin):
    """
    Admin for student Enrollments.

    Displays computed fee fields (total_paid, balance_amount) as read-only
    columns and inline Payment Records so admins can record manual payments
    without leaving the enrollment page.
    """

    list_display = [
        'user', 'course', 'payment_status',
        'course_fee', 'get_total_paid', 'get_balance_amount',
        'enrolled_at',
    ]
    list_filter = ['course', 'payment_status']
    search_fields = ['user__email', 'course__title']
    ordering = ['-enrolled_at']
    compressed_fields = True
    show_full_result_count = False
    inlines = [PaymentRecordInline]
    actions = [export_enrollments_excel, export_enrollments_pdf]
    readonly_fields = ('enrolled_at', 'get_total_paid', 'get_balance_amount')

    fieldsets = (
        (None, {
            'fields': ('user', 'course', 'enrolled_at')
        }),
        ('Fee & Payment', {
            'fields': (
                'payment_status',
                'course_fee',
                'payment_amount',
                'payment_date',
                'get_total_paid',
                'get_balance_amount',
            ),
            'description': (
                'Set <strong>Course Fee</strong> to the agreed amount for this student. '
                'Add individual payments in the <strong>Payment Records</strong> section below.'
            ),
        }),
        ('Progress', {
            'fields': ('last_watched_lesson',)
        }),
    )

    @admin.display(description='Total Paid (₹)')
    def get_total_paid(self, obj):
        """Return the sum of all payment records for this enrollment."""
        return f'₹{obj.total_paid:,.2f}'

    @admin.display(description='Balance Due (₹)')
    def get_balance_amount(self, obj):
        """Return the outstanding balance (course_fee - total_paid)."""
        balance = obj.balance_amount
        return f'₹{balance:,.2f}'

@admin.register(PaymentRecord)
class PaymentRecordAdmin(ModelAdmin):
    list_display = ['enrollment', 'amount', 'payment_date', 'payment_method']
    list_filter = ['payment_method', 'payment_date', 'enrollment__course']
    search_fields = ['enrollment__user__email', 'reference_id']
    ordering = ['-payment_date']
    compressed_fields = True
    show_full_result_count = False


@admin.register(LiveClass)
class LiveClassAdmin(ModelAdmin):
    list_display = ['title', 'course', 'scheduled_time', 'zoom_link', 'status']
    list_filter = ['course', 'status']
    search_fields = ['title', 'course__title']
    ordering = ['scheduled_time']
    compressed_fields = True
    show_full_result_count = False

    def save_model(self, request, obj, form, change):
        """Send a live-class reminder email to all enrolled students on creation."""
        is_new = not change  # True only when creating, not editing
        super().save_model(request, obj, form, change)

        if not is_new:
            return  # Skip emails when editing an existing live class

        # Fetch all active students enrolled in this course
        enrollments = (
            Enrollment.objects
            .filter(course=obj.course)
            .select_related('user')
        )

        if not enrollments.exists():
            self.message_user(
                request,
                f'Live class "{obj.title}" created. No enrolled students found — no emails sent.',
                level='warning',
            )
            return

        # Format scheduled time in a readable format (convert from UTC if needed)
        local_time = timezone.localtime(obj.scheduled_time) if timezone.is_aware(obj.scheduled_time) else obj.scheduled_time
        formatted_time = local_time.strftime('%A, %d %B %Y at %I:%M %p')

        sent_count = 0
        failed_count = 0

        for enrollment in enrollments:
            student = enrollment.user
            if not student.email or not student.is_active:
                continue

            student_name = student.full_name or student.email.split('@')[0]

            # Render HTML template
            context = {
                'student_name': student_name,
                'course_title': obj.course.title,
                'class_title': obj.title,
                'scheduled_time': formatted_time,
                'zoom_link': obj.zoom_link,
                'year': timezone.now().year,
            }
            html_body  = render_to_string('emails/live_class_reminder.html', context)
            plain_body = strip_tags(html_body)

            try:
                msg = EmailMultiAlternatives(
                    subject=f'🎥 Live Class Reminder: {obj.title} — {obj.course.title}',
                    body=plain_body,
                    from_email=None,  # Uses DEFAULT_FROM_EMAIL / EMAIL_HOST_USER
                    to=[student.email],
                )
                msg.attach_alternative(html_body, 'text/html')
                msg.send(fail_silently=False)
                sent_count += 1
            except Exception as e:
                failed_count += 1

        # Show admin feedback message
        if failed_count == 0:
            self.message_user(
                request,
                f'Live class "{obj.title}" created. Reminder emails sent to {sent_count} enrolled student(s). ✅',
            )
        else:
            self.message_user(
                request,
                f'Live class "{obj.title}" created. Emails sent: {sent_count}, failed: {failed_count}.',
                level='warning',
            )

@admin.register(LiveClassAttendance)
class LiveClassAttendanceAdmin(ModelAdmin):
    list_display = ['student', 'live_class', 'status', 'timestamp']
    list_filter = ['status', 'live_class__course', 'live_class']
    search_fields = ['student__email', 'live_class__title']
    ordering = ['-timestamp']
    compressed_fields = True
    show_full_result_count = False
