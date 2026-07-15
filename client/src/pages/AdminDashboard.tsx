import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AdminCourses from '../components/admin/AdminCourses';
import AdminStudents from '../components/admin/AdminStudents';
import { LayoutDashboard, BookOpen, Users, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students'>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <AdminCourses />;
      case 'students':
        return <AdminStudents />;
      case 'overview':
      default:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
              <div className="glass-panel p-6">
                <h3 className="text-secondary text-sm flex items-center gap-2 mb-2"><Users size={16} /> Total Students</h3>
                <p className="text-4xl font-bold">0</p>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-secondary text-sm flex items-center gap-2 mb-2"><BookOpen size={16} /> Active Courses</h3>
                <p className="text-4xl font-bold">0</p>
              </div>
              <div className="glass-panel p-6">
                <h3 className="text-secondary text-sm flex items-center gap-2 mb-2"><LayoutDashboard size={16} /> Upcoming Live Classes</h3>
                <p className="text-4xl font-bold">0</p>
              </div>
            </div>

            <div className="glass-panel p-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex gap-4 flex-wrap">
                <button onClick={() => setActiveTab('courses')} className="btn btn-secondary">Manage Courses</button>
                <button onClick={() => setActiveTab('students')} className="btn btn-secondary">Manage Students</button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 mr-0 rounded-r-none border-r-0 flex flex-col h-[calc(100vh-2rem)]">
        <div className="p-6 border-b border-[var(--glass-border)]">
          <h1 className="text-xl font-bold text-[var(--accent-primary)]">Admin Portal</h1>
        </div>
        <nav className="p-4 flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${activeTab === 'overview' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${activeTab === 'courses' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
          >
            <BookOpen size={18} /> Courses
          </button>
          <button 
            onClick={() => setActiveTab('students')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${activeTab === 'students' ? 'bg-[var(--accent-primary)] text-white shadow-lg' : 'text-secondary hover:bg-[rgba(255,255,255,0.05)]'}`}
          >
            <Users size={18} /> Students
          </button>
        </nav>
        <div className="p-4 border-t border-[var(--glass-border)]">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-secondary hover:text-[var(--error)] hover:bg-[var(--error)] hover:bg-opacity-10 rounded-lg transition-all w-full text-left">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
