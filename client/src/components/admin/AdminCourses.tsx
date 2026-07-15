import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Plus, Edit2, Trash2, Folder, BookOpen } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/lms/admin/courses/');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/lms/admin/courses/', newCourse);
      setIsCreating(false);
      setNewCourse({ title: '', description: '' });
      fetchCourses();
    } catch (error) {
      console.error('Failed to create course', error);
    }
  };

  if (loading) return <div>Loading courses...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen size={20} className="text-[var(--accent-primary)]" />
          Course Management
        </h2>
        <button 
          onClick={() => setIsCreating(!isCreating)} 
          className="btn btn-primary text-sm px-4 py-2"
        >
          <Plus size={16} />
          New Course
        </button>
      </div>

      {isCreating && (
        <div className="glass-panel p-6 mb-6 animate-fade-in border border-[var(--accent-primary)]">
          <h3 className="font-semibold mb-4">Create New Course</h3>
          <form onSubmit={handleCreateCourse}>
            <div className="input-group">
              <label className="input-label">Course Title</label>
              <input 
                type="text" 
                className="input-field" 
                value={newCourse.title}
                onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea 
                className="input-field min-h-[100px]" 
                value={newCourse.description}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
              />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary px-6">Save</button>
              <button type="button" onClick={() => setIsCreating(false)} className="btn btn-secondary px-6">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="glass-panel p-6 hover:border-[var(--glass-border)] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg text-[var(--accent-primary)] group-hover:text-[var(--accent-hover)] transition-colors">{course.title}</h3>
              <div className="flex gap-2">
                <button className="text-secondary hover:text-[var(--accent-primary)] transition-colors"><Edit2 size={16} /></button>
                <button className="text-secondary hover:text-[var(--error)] transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
            <p className="text-sm text-secondary line-clamp-2">{course.description || "No description provided."}</p>
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex items-center gap-2 text-sm text-secondary">
              <Folder size={14} />
              <span>Manage Modules</span>
            </div>
          </div>
        ))}
        
        {courses.length === 0 && !isCreating && (
          <div className="col-span-full text-center p-8 text-secondary border border-dashed border-[var(--glass-border)] rounded-lg">
            No courses found. Create your first course to get started.
          </div>
        )}
      </div>
    </div>
  );
}
