import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { PlayCircle, Clock } from 'lucide-react';

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

  if (loading) return <div className="text-secondary">Loading your courses...</div>;

  if (courses.length === 0) {
    return (
      <div className="glass-panel p-12 text-center text-secondary">
        <h3 className="text-xl text-[var(--text-primary)] mb-2">No Courses Yet</h3>
        <p>You haven't been enrolled in any courses yet. Please contact your administrator.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <div 
          key={course.id} 
          onClick={() => onSelectCourse(course.id)}
          className="glass-panel p-6 flex flex-col justify-between group cursor-pointer transition-all hover:border-[var(--accent-primary)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)]"
        >
          <div>
            <div className="h-40 bg-[var(--bg-secondary)] rounded-md mb-4 flex items-center justify-center overflow-hidden relative group-hover:scale-[1.02] transition-transform">
              <PlayCircle size={48} className="text-[var(--accent-light)] group-hover:text-[var(--accent-primary)] transition-colors absolute z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)] to-[rgba(99,102,241,0.1)]"></div>
            </div>
            <h4 className="font-semibold text-xl group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{course.title}</h4>
            <p className="text-sm text-secondary mt-2 line-clamp-2">{course.description || "No description available."}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--glass-border)] flex justify-between items-center">
            <span className="text-xs font-medium bg-[var(--success)] bg-opacity-20 text-[var(--success)] px-2 py-1 rounded">Enrolled</span>
            <span className="text-xs text-secondary flex items-center gap-1"><Clock size={12}/> Start Learning</span>
          </div>
        </div>
      ))}
    </div>
  );
}
