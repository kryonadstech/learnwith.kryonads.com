import { useState, useEffect } from 'react';
import api from '../../api/axios';
import SecurePlayer from './SecurePlayer';
import { ChevronLeft, Play, FileText, Headphones, Lock } from 'lucide-react';

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
  const [activeMedia, setActiveMedia] = useState<Media | null>(null);

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
            setActiveMedia(firstLesson.media[0]);
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
    switch(type) {
      case 'video': return <Play size={14} />;
      case 'audio': return <Headphones size={14} />;
      case 'notes': return <FileText size={14} />;
      default: return <FileText size={14} />;
    }
  };

  if (loading) return <div className="text-secondary text-center py-12">Loading course content...</div>;
  if (!course) return <div className="text-[var(--error)] text-center py-12">Failed to load course.</div>;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-secondary hover:text-[var(--text-primary)] transition-colors w-fit mb-6"
      >
        <ChevronLeft size={20} /> Back to My Courses
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
          
          {activeMedia ? (
            <div className="mb-6">
              <SecurePlayer mediaUrl={activeMedia.file} mediaType={activeMedia.media_type} />
              <h3 className="text-xl font-semibold mt-4">{activeLesson?.title}</h3>
              {activeMedia.title && <p className="text-secondary mt-1">{activeMedia.title}</p>}
            </div>
          ) : (
            <div className="h-64 glass-panel flex flex-col items-center justify-center text-secondary mb-6">
              <Lock size={48} className="mb-4 opacity-50" />
              <p>Select a lesson from the syllabus to begin learning.</p>
            </div>
          )}
        </div>

        {/* Sidebar Syllabus */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="glass-panel p-4 h-[calc(100vh-160px)] overflow-y-auto sticky top-24">
            <h3 className="font-semibold text-lg mb-4 pb-2 border-b border-[var(--glass-border)]">Syllabus</h3>
            
            {course.modules.length === 0 ? (
              <p className="text-sm text-secondary">No modules available yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {course.modules.map(module => (
                  <div key={module.id}>
                    <h4 className="font-medium text-[var(--accent-primary)] mb-2">{module.title}</h4>
                    <div className="flex flex-col gap-1 pl-2 border-l border-[var(--glass-border)]">
                      {module.lessons.map(lesson => (
                        <div key={lesson.id} className="mb-2">
                          <button
                            onClick={() => {
                              setActiveLesson(lesson);
                              if (lesson.media.length > 0) setActiveMedia(lesson.media[0]);
                            }}
                            className={`text-left w-full text-sm py-1.5 px-2 rounded transition-colors ${activeLesson?.id === lesson.id ? 'bg-[rgba(255,255,255,0.1)] text-[var(--text-primary)]' : 'text-secondary hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                          >
                            {lesson.title}
                          </button>
                          
                          {/* Media Links if lesson is active */}
                          {activeLesson?.id === lesson.id && lesson.media.length > 1 && (
                            <div className="flex flex-col gap-1 pl-4 pr-2 py-2 bg-[rgba(0,0,0,0.2)] rounded-b">
                              {lesson.media.map(media => (
                                <button
                                  key={media.id}
                                  onClick={() => setActiveMedia(media)}
                                  className={`flex items-center gap-2 text-xs py-1 px-2 rounded transition-colors ${activeMedia?.id === media.id ? 'text-[var(--accent-primary)] bg-[var(--accent-light)]' : 'text-secondary hover:text-[var(--text-primary)]'}`}
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
    </div>
  );
}
