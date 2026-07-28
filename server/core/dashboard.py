"""
Dashboard callback for Django Unfold admin.
This function is called on every admin index page load.
It injects real database stats directly into the template context —
no JS fetch, no auth issues, no mock data.
"""
import json
from django.utils import timezone


def dashboard_callback(request, context):
    from lms.models import Course, Module, Lesson, Media, Enrollment, LiveClass, PaymentRecord
    from users.models import User, Inquiry
    from django.core.cache import cache
    from django.db.models import Sum
    import json

    cache_key = 'unfold_dashboard_stats'
    cached_dashboard = cache.get(cache_key)
    if cached_dashboard:
        context.update({'dashboard': cached_dashboard})
        return context

    # ── Core stats ──────────────────────────────────────────────────
    total_students = User.objects.filter(is_student=True).count()
    total_courses = Course.objects.count()
    total_instructors = User.objects.filter(is_staff=True).count()
    total_enrollments = Enrollment.objects.count()
    total_lessons = Lesson.objects.count()
    total_media = Media.objects.count()
    total_live = LiveClass.objects.count()

    # ── Top courses by enrollment count ─────────────────────────────
    top_courses = []
    for course in Course.objects.prefetch_related('modules__lessons', 'enrollments').all():
        enroll_count = course.enrollments.count()
        lesson_count = sum(m.lessons.count() for m in course.modules.all())
        top_courses.append({
            'title': course.title,
            'enrollments': enroll_count,
            'lessons': lesson_count,
        })
    top_courses.sort(key=lambda x: x['enrollments'], reverse=True)

    # ── Graph: top courses ────────────────────────────────────
    graph_labels = [c['title'] for c in top_courses]
    graph_data = [c['enrollments'] for c in top_courses]

    # ── Recent enrollments ──────────────────────────────────────────
    recent_enrollments = []
    for e in Enrollment.objects.select_related('user', 'course').order_by('-enrolled_at')[:6]:
        recent_enrollments.append({
            'student': e.user.email,
            'course': e.course.title,
            'date': e.enrolled_at.strftime('%d %b %Y'),
        })

    # ── Latest students ─────────────────────────────────────────────
    latest_students = []
    for u in User.objects.filter(is_student=True).order_by('-created_at')[:6]:
        latest_students.append({
            'email': u.email,
            'date': u.created_at.strftime('%d %b %Y'),
            'is_active': u.is_active,
            'initial': u.email[0].upper(),
        })

    # ── Top instructors ──────────────────────────────────────────────
    top_instructors = []
    for staff in User.objects.filter(is_staff=True).order_by('-created_at')[:6]:
        top_instructors.append({
            'name': staff.full_name or staff.email,
            'role': 'Admin' if staff.is_superuser else 'Instructor',
        })

    # ── Upcoming live classes ────────────────────────────────────────
    live_classes = []
    for lc in LiveClass.objects.select_related('course').filter(
        scheduled_time__gte=timezone.now()
    ).order_by('scheduled_time')[:6]:
        live_classes.append({
            'title': lc.title,
            'course': lc.course.title,
            'time': lc.scheduled_time.strftime('%d %b %Y, %H:%M'),
            'zoom_link': lc.zoom_link,
        })

    # ── Past live classes (shown if no upcoming) ─────────────────────
    past_live_classes = []
    if not live_classes:
        for lc in LiveClass.objects.select_related('course').filter(
            scheduled_time__lt=timezone.now()
        ).order_by('-scheduled_time')[:6]:
            past_live_classes.append({
                'title': lc.title,
                'course': lc.course.title,
                'time': lc.scheduled_time.strftime('%d %b %Y, %H:%M'),
                'zoom_link': lc.zoom_link,
            })

    # ── Media breakdown ─────────────────────────────────────────────
    video_count = Media.objects.filter(media_type='video').count()
    audio_count = Media.objects.filter(media_type='audio').count()
    notes_count = Media.objects.filter(media_type='notes').count()

    # ── Revenue stats (from PaymentRecord) ──────────────────────────
    now = timezone.now()

    total_revenue = PaymentRecord.objects.aggregate(t=Sum('amount'))['t'] or 0

    monthly_revenue = PaymentRecord.objects.filter(
        payment_date__year=now.year,
        payment_date__month=now.month,
    ).aggregate(t=Sum('amount'))['t'] or 0

    # Pending = sum of balance_amount across all enrollments
    pending_revenue = 0
    for enr in Enrollment.objects.select_related('course').prefetch_related('payment_records').all():
        fee = enr.course_fee if enr.course_fee else enr.course.price
        paid = sum(p.amount for p in enr.payment_records.all())
        balance = max(fee - paid, 0)
        pending_revenue += balance

    # Monthly revenue breakdown for the current year (for the trend chart)
    monthly_labels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    monthly_data = []
    for month in range(1, 13):
        val = PaymentRecord.objects.filter(
            payment_date__year=now.year,
            payment_date__month=month,
        ).aggregate(t=Sum('amount'))['t'] or 0
        monthly_data.append(float(val))

    # ── Recent payments ──────────────────────────────────────────────
    recent_payments = []
    for p in PaymentRecord.objects.select_related(
        'enrollment__user', 'enrollment__course'
    ).order_by('-payment_date')[:6]:
        recent_payments.append({
            'student': p.enrollment.user.email,
            'course': p.enrollment.course.title,
            'amount': float(p.amount),
            'method': p.get_payment_method_display(),
            'date': p.payment_date.strftime('%d %b %Y'),
        })

    # ── Unresolved inquiries ─────────────────────────────────────────
    unresolved_inquiries = []
    for inquiry in Inquiry.objects.filter(is_resolved=False).order_by('-created_at')[:6]:
        unresolved_inquiries.append({
            'name': inquiry.name,
            'email': inquiry.email,
            'course_interest': inquiry.course_interest or 'General',
            'created_at': inquiry.created_at.strftime('%d %b %Y %H:%M'),
        })

    # ── Inject into template context ────────────────────────────────
    dashboard_data = {
        'total_students': total_students,
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
        'total_lessons': total_lessons,
        'total_media': total_media,
        'total_live': total_live,
        'top_courses': top_courses[:5],
        'recent_enrollments': recent_enrollments,
        'recent_payments': recent_payments,
        'unresolved_inquiries': unresolved_inquiries,
        'latest_students': latest_students,
        'live_classes': live_classes or past_live_classes,
        'live_is_upcoming': bool(live_classes),
        'graph_labels': graph_labels,
        'graph_data': graph_data,
        # JSON-safe strings for embedding in <script> blocks
        'graph_labels_json': json.dumps(graph_labels),
        'graph_data_json': json.dumps(graph_data),
        'video_count': video_count,
        'audio_count': audio_count,
        'notes_count': notes_count,
        'total_instructors': total_instructors,
        'top_instructors': top_instructors,
        # Revenue
        'total_revenue': float(total_revenue),
        'monthly_revenue': float(monthly_revenue),
        'pending_revenue': float(pending_revenue),
        'revenue_monthly_json': json.dumps(monthly_data),
        'revenue_labels_json': json.dumps(monthly_labels),
        'current_year': now.year,
    }

    cache.set(cache_key, dashboard_data, 60 * 15)
    
    context.update({'dashboard': dashboard_data})
    return context
