"""
Dashboard callback for Django Unfold admin.
This function is called on every admin index page load.
It injects real database stats directly into the template context —
no JS fetch, no auth issues, no mock data.
"""
import json
from django.utils import timezone


def dashboard_callback(request, context):
    from lms.models import Course, Module, Lesson, Media, Enrollment, LiveClass
    from users.models import User

    # ── Core stats ──────────────────────────────────────────────────
    total_students = User.objects.filter(is_student=True).count()
    total_courses = Course.objects.count()
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

    # ── Graph: lessons per course ────────────────────────────────────
    graph_labels = [c['title'] for c in top_courses]
    graph_data = [c['lessons'] for c in top_courses]

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

    # ── Inject into template context ────────────────────────────────
    context.update({
        'dashboard': {
            'total_students': total_students,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_lessons': total_lessons,
            'total_media': total_media,
            'total_live': total_live,
            'top_courses': top_courses[:5],
            'recent_enrollments': recent_enrollments,
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
        }
    })
    return context
