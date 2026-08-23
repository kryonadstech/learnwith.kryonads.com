from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import Course, Lesson, Media, Module, get_google_drive_file_id
from .serializers import MediaSerializer


class GoogleDriveMediaTests(TestCase):
    def setUp(self):
        course = Course.objects.create(title="Drive media course")
        module = Module.objects.create(course=course, title="Module 1")
        self.lesson = Lesson.objects.create(module=module, title="Lesson 1")
        self.drive_url = "https://drive.google.com/file/d/1AbcDeFgHiJkLmNoPqRsTuVwXyZ12345/view?usp=sharing"

    def test_extracts_file_id_from_common_google_drive_urls(self):
        file_id = "1AbcDeFgHiJkLmNoPqRsTuVwXyZ12345"
        self.assertEqual(get_google_drive_file_id(self.drive_url), file_id)
        self.assertEqual(
            get_google_drive_file_id(f"https://drive.google.com/open?id={file_id}"),
            file_id,
        )
        self.assertIsNone(get_google_drive_file_id("https://example.com/file/d/not-drive"))

    def test_media_requires_a_drive_link_when_no_legacy_file_exists(self):
        media = Media(lesson=self.lesson, media_type="video")
        with self.assertRaises(ValidationError):
            media.full_clean()

    def test_serializer_exposes_drive_preview_url(self):
        media = Media.objects.create(
            lesson=self.lesson,
            media_type="video",
            title="Recorded class",
            drive_url=self.drive_url,
        )

        data = MediaSerializer(media).data
        self.assertEqual(data["drive_url"], self.drive_url)
        self.assertEqual(
            data["embed_url"],
            "https://drive.google.com/file/d/1AbcDeFgHiJkLmNoPqRsTuVwXyZ12345/preview",
        )
        self.assertEqual(data["legacy_file_url"], "")

    def test_serializer_rejects_non_drive_urls(self):
        serializer = MediaSerializer(
            data={
                "lesson": str(self.lesson.id),
                "media_type": "notes",
                "title": "Lesson notes",
                "drive_url": "https://example.com/lesson-notes.pdf",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("drive_url", serializer.errors)
