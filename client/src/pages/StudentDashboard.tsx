import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MyCourses from '../components/student/MyCourses';
import CourseViewer from '../components/student/CourseViewer';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="glass-panel sticky top-0 z-50 rounded-none border-x-0 border-t-0 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 
            className="text-xl font-bold m-0 text-[var(--accent-primary)] cursor-pointer"
            onClick={() => setSelectedCourseId(null)}
          >
            Krayonads LMS
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary hidden sm:inline-block">{user?.email}</span>
            <button onClick={logout} className="btn btn-secondary text-sm px-3 py-1.5">Log out</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-6">
        {!selectedCourseId ? (
          <>
            <div className="mb-10 animate-fade-in">
              <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
              <p className="text-secondary">Pick up right where you left off.</p>
            </div>
            <h3 className="text-xl font-semibold mb-6 border-b border-[var(--glass-border)] pb-2 inline-block">My Courses</h3>
            <MyCourses onSelectCourse={setSelectedCourseId} />
          </>
        ) : (
          <CourseViewer courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
        )}
      </main>
    </div>
  );
}
