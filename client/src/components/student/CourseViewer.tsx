import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import SecurePlayer from './SecurePlayer';
import {
  BookOpen,
  ChevronLeft,
  CirclePlay,
  FileText,
  Headphones,
  Layers,
  List,
  Lock,
  Play,
} from 'lucide-react';

interface Media {
  id: string;
  lesson: string;
  media_type: 'video' | 'audio' | 'notes';
  drive_url: string;
  embed_url: string;
  legacy_file_url: string;
  title: string;
}

interface Lesson {
  id: string;
  title: string;
  media: Media[];
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  modules: Module[];
}

interface CourseViewerProps {
  courseId: string;
  onBack: () => void;
}

const mediaLabels = {
  video: 'Video lesson',
  audio: 'Audio lesson',
  notes: 'Lesson notes',
} as const;

export default function CourseViewer({ courseId, onBack }: CourseViewerProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const playerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await api.get(`/lms/student/courses/${courseId}/`);
        setCourse(response.data);

        const firstLesson = response.data.modules?.[0]?.lessons?.[0];
        if (firstLesson) {
          setActiveLesson(firstLesson);
          setActiveMediaId(firstLesson.media?.[0]?.id ?? null);
        }
      } catch (error) {
        console.error('Failed to fetch course details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const getMediaIcon = (type: Media['media_type'], size = 16) => {
    switch (type) {
      case 'video':
        return <Play size={size} />;
      case 'audio':
        return <Headphones size={size} />;
      case 'notes':
        return <FileText size={size} />;
    }
  };

  const selectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveMediaId(lesson.media[0]?.id ?? null);
    setIsSidebarOpen(false);
    requestAnimationFrame(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  if (loading) return <div className="text-secondary text-center py-12">Loading course content...</div>;
  if (!course) return <div className="text-[var(--error)] text-center py-12">Failed to load course.</div>;

  const selectedMedia = activeLesson?.media.find((media) => media.id === activeMediaId) ?? null;
  const activeModule = course.modules.find((module) =>
    module.lessons.some((lesson) => lesson.id === activeLesson?.id),
  );

  return (
    <div className="sd-course-page animate-fade-in">
      <button type="button" onClick={onBack} className="sd-back-link">
        <ChevronLeft size={18} /> Back to My Courses
      </button>

      <div className="sd-course-heading">
        <div>
          <span className="sd-course-kicker"><BookOpen size={15} /> Course workspace</span>
          <h2>{course.title}</h2>
          <p>Choose a lesson, then select one resource to keep your learning focused.</p>
        </div>
        <button
          type="button"
          className="sd-mobile-sidebar-toggle"
          onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
          aria-expanded={isSidebarOpen}
          aria-controls="course-syllabus"
        >
          <span>{isSidebarOpen ? 'Hide course content' : 'Course content'}</span>
          <List size={18} />
        </button>
      </div>

      <div className="sd-viewer-layout">
        <main ref={playerRef} className="sd-main-content" aria-label="Lesson player">
          <div className="sd-lesson-heading">
            <div className="sd-lesson-icon"><BookOpen size={20} /></div>
            <div className="sd-lesson-heading-copy">
              <p>{activeModule?.title || 'Course lesson'}</p>
              <h3>{activeLesson?.title || 'Select a lesson'}</h3>
            </div>
            {activeLesson && (
              <span className="sd-resource-count">
                <Layers size={15} /> {activeLesson.media.length} {activeLesson.media.length === 1 ? 'resource' : 'resources'}
              </span>
            )}
          </div>

          {selectedMedia ? (
            <section className="sd-learning-stage" aria-live="polite">
              {activeLesson && activeLesson.media.length > 1 && (
                <nav className="sd-resource-switcher" aria-label="Lesson resources">
                  <span className="sd-resource-switcher-label">Lesson resources</span>
                  <div className="sd-resource-tabs">
                    {activeLesson.media.map((media) => (
                      <button
                        type="button"
                        key={media.id}
                        onClick={() => setActiveMediaId(media.id)}
                        className={`sd-resource-tab ${activeMediaId === media.id ? 'active' : ''}`}
                        aria-pressed={activeMediaId === media.id}
                        title={media.title || mediaLabels[media.media_type]}
                      >
                        {getMediaIcon(media.media_type, 15)}
                        <span>{media.title || mediaLabels[media.media_type]}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              )}

              <div className="sd-player-header">
                <span className={`sd-media-type sd-media-type--${selectedMedia.media_type}`}>
                  {getMediaIcon(selectedMedia.media_type, 14)} {mediaLabels[selectedMedia.media_type]}
                </span>
                <h4>{selectedMedia.title || mediaLabels[selectedMedia.media_type]}</h4>
              </div>

              <SecurePlayer
                embedUrl={selectedMedia.embed_url}
                legacyMediaUrl={selectedMedia.legacy_file_url}
                mediaType={selectedMedia.media_type}
              />
            </section>
          ) : (
            <div className="sd-empty-lesson">
              <Lock size={32} />
              <h4>{activeLesson ? 'This lesson has no resources yet' : 'Select a lesson to begin'}</h4>
              <p>{activeLesson ? 'Your instructor will add the learning material here.' : 'Use the course content panel to choose where to start.'}</p>
            </div>
          )}
        </main>

        <aside id="course-syllabus" className={`sd-sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Course content">
          <div className="sd-sidebar-heading">
            <div>
              <p>Course content</p>
              <h3>Course syllabus</h3>
            </div>
            <span>{course.modules.length} {course.modules.length === 1 ? 'module' : 'modules'}</span>
          </div>

          {course.modules.length === 0 ? (
            <p className="text-sm text-secondary">No modules available yet.</p>
          ) : (
            <div className="sd-module-list">
              {course.modules.map((module, moduleIndex) => (
                <section key={module.id} className="sd-module-group">
                  <div className="sd-module-heading">
                    <span>Module {moduleIndex + 1}</span>
                    <h4>{module.title}</h4>
                  </div>

                  <div className="sd-lesson-list">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const resourceCount = lesson.media.length;
                      const isActive = activeLesson?.id === lesson.id;

                      return (
                        <button
                          type="button"
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          className={`sd-lesson-btn ${isActive ? 'active' : ''}`}
                          aria-current={isActive ? 'step' : undefined}
                        >
                          <span className="sd-lesson-number">{moduleIndex + 1}.{lessonIndex + 1}</span>
                          <span className="sd-lesson-summary">
                            <strong>{lesson.title}</strong>
                            <small>{resourceCount === 0 ? 'No resources yet' : `${resourceCount} ${resourceCount === 1 ? 'resource' : 'resources'}`}</small>
                          </span>
                          <CirclePlay size={17} className="sd-lesson-action" />
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
