import { useState, useEffect } from 'react';
import api from '../../api/axios';
import SecurePlayer from './SecurePlayer';
import { ChevronLeft, Play, FileText, Headphones, Lock, Layers } from 'lucide-react';

interface Media {
  id: string;
  media_type: 'video' | 'audio' | 'notes';
  file: string;
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

export default function CourseViewer({ courseId, onBack }: CourseViewerProps) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeMediaId, setActiveMediaId] = useState<string | 'all' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        // Here we hit the same endpoint, but we can reuse the CourseSerializer
        // to get the nested modules and lessons.
        const response = await api.get(`/lms/student/courses/${courseId}/`);
        setCourse(response.data);

        // Auto-select first lesson if available
        if (response.data.modules?.[0]?.lessons?.[0]) {
          const firstLesson = response.data.modules[0].lessons[0];
          setActiveLesson(firstLesson);
          if (firstLesson.media?.[0]) {
            setActiveMediaId('all');
          }
        }
      } catch (error) {
        console.error('Failed to fetch course details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play size={14} />;
      case 'audio':
        return <Headphones size={14} />;
      case 'notes':
        return <FileText size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  if (loading) return <div className="text-secondary text-center py-12">Loading course content...</div>;
  if (!course) return <div className="text-[var(--error)] text-center py-12">Failed to load course.</div>;

  return (
    <div className="animate-fade-in">
      <a onClick={onBack} className="sd-back-link">
        <ChevronLeft size={20} /> Back to My Courses
      </a>

      {/* Mobile Syllabus Toggle */}
      <button className="sd-mobile-sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <span>{isSidebarOpen ? 'Hide Syllabus' : 'View Syllabus'}</span>
        <FileText size={18} />
      </button>

      <div className="sd-viewer-layout">
        <div className="sd-main-content bg-[var(--sd-glass)] rounded-2xl shadow-sm border border-[var(--sd-glass-border)] p-6 md:p-10 flex flex-col gap-8">
          <div className="border-b border-[var(--sd-glass-border)] pb-8">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--sd-text)]">
              {course.title}
            </h2>
            {activeLesson && (
              <p className="text-secondary mt-3 text-lg font-medium">{activeLesson.title}</p>
            )}
          </div>

          {(() => {
            const activeMediaList = activeMediaId === 'all' 
              ? activeLesson?.media || []
              : activeLesson?.media.filter(m => m.id === activeMediaId) || [];

            if (activeMediaList.length > 0) {
              return (
                <div className="flex flex-col gap-24 mt-6">
                  {activeMediaList.map(media => (
                    <div key={media.id} className="flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--sd-accent-tint)] text-[var(--sd-accent)] rounded-xl shadow-sm">
                          {getMediaIcon(media.media_type)}
                        </div>
                        <h3 className="text-2xl font-semibold text-[var(--sd-text)]">
                          {media.title || (media.media_type.charAt(0).toUpperCase() + media.media_type.slice(1))}
                        </h3>
                      </div>
                      <div className="w-full">
                        <SecurePlayer mediaUrl={media.file} mediaType={media.media_type} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return (
              <div className="h-64 flex flex-col items-center justify-center text-secondary mt-4 bg-[var(--sd-accent-tint)] rounded-2xl">
                <Lock size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a lesson from the syllabus to begin learning.</p>
              </div>
            );
          })()}
        </div>

        {/* Sidebar Syllabus */}
        <div className={`sd-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              borderBottom: '1px solid var(--sd-glass-border)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
              color: 'var(--sd-text)',
            }}
          >
            Course Syllabus
          </h3>

          {course.modules.length === 0 ? (
            <p className="text-sm text-secondary">No modules available yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {course.modules.map((module) => (
                <div key={module.id}>
                  <h4 className="sd-module-title">{module.title}</h4>
                  <div className="flex flex-col gap-1">
                    {module.lessons.map((lesson) => (
                      <div key={lesson.id} className="mb-2">
                        <button
                          onClick={() => {
                            setActiveLesson(lesson);
                            if (lesson.media.length > 0) setActiveMediaId('all');
                            if (window.innerWidth <= 1024) setIsSidebarOpen(false);
                          }}
                          className={`sd-lesson-btn ${activeLesson?.id === lesson.id ? 'active' : ''}`}
                        >
                          <Play size={14} />
                          <span>{lesson.title}</span>
                        </button>

                        {/* Media Links if lesson is active */}
                        {activeLesson?.id === lesson.id && lesson.media.length > 1 && (
                          <div className="sd-media-links flex flex-col gap-1">
                            <button
                              onClick={() => setActiveMediaId('all')}
                              className={`sd-media-btn ${activeMediaId === 'all' ? 'active' : ''}`}
                            >
                              <Layers size={14} />
                              <span>View All</span>
                            </button>
                            {lesson.media.map((media) => (
                              <button
                                key={media.id}
                                onClick={() => setActiveMediaId(media.id)}
                                className={`sd-media-btn ${activeMediaId === media.id ? 'active' : ''}`}
                              >
                                {getMediaIcon(media.media_type)}
                                <span>{media.title || media.media_type}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}