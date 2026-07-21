import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PlayCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
}

interface MyCoursesProps {
  onSelectCourse: (courseId: string) => void;
}

export default function MyCourses({ onSelectCourse }: MyCoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await api.get('/lms/student/courses/');
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch enrolled courses', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

  if (loading) return <div style={{ color: 'var(--sd-text-muted)' }}>Loading your courses...</div>;

  if (courses.length === 0) {
    return (
      <div
        style={{
          background: 'var(--sd-surface)',
          border: '1px solid var(--sd-glass-border)',
          padding: '3rem',
          textAlign: 'center',
          borderRadius: '1.25rem',
        }}
      >
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--sd-text)' }}>No Courses Yet</h3>
        <p style={{ color: 'var(--sd-text-muted)' }}>
          You haven't been enrolled in any courses yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="sd-grid">
      {courses.map((course) => (
        <div key={course.id} onClick={() => onSelectCourse(course.id)} className="sd-card">
          <div className="sd-card-img-wrapper">
            <div className="sd-card-play-badge">
              <PlayCircle size={26} className="sd-card-play" />
            </div>
          </div>

          <h4 className="sd-card-title">{course.title}</h4>
          <p className="sd-card-desc">{course.description || 'No description available for this course.'}</p>

          {/* Mock Progress Bar */}
          <div className="sd-progress-wrap">
            <div className="sd-progress-fill" style={{ width: `${Math.floor(Math.random() * 60) + 10}%` }}></div>
          </div>

          <div className="sd-card-footer">
            <span className="sd-badge">Enrolled</span>
            <span className="sd-start-btn">
              Continue <PlayCircle size={14} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}