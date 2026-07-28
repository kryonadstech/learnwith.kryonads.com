from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Course, Module, Lesson, Media, Enrollment, LiveClass, PaymentRecord

def bust_lms_caches(sender, instance, **kwargs):
    cache.clear()

@receiver(post_save, sender=Course)
@receiver(post_delete, sender=Course)
@receiver(post_save, sender=Module)
@receiver(post_delete, sender=Module)
@receiver(post_save, sender=Lesson)
@receiver(post_delete, sender=Lesson)
@receiver(post_save, sender=Media)
@receiver(post_delete, sender=Media)
@receiver(post_save, sender=Enrollment)
@receiver(post_delete, sender=Enrollment)
@receiver(post_save, sender=LiveClass)
@receiver(post_delete, sender=LiveClass)
@receiver(post_save, sender=PaymentRecord)
@receiver(post_delete, sender=PaymentRecord)
def lms_model_changed(sender, instance, **kwargs):
    # Simply clear the entire cache when any LMS model changes.
    # This guarantees that the admin dashboard, student endpoints, and admin API endpoints are always perfectly fresh.
    cache.clear()
