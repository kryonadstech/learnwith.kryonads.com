import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, BookOpen, Settings, Sparkles, ChevronDown } from 'lucide-react';
import MyCourses from '../components/student/MyCourses';
import CourseViewer from '../components/student/CourseViewer';
import ProfileView from '../components/student/ProfileView';
import logo from '../assets/logo.png';
import '../styles/student-dashboard.css';

// Builds a two-letter initials fallback for the avatar when there's no profile photo
function getInitials(name?: string) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'courses' | 'profile'>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const handleLogoClick = () => {
    setSelectedCourseId(null);
    setActiveTab('courses');
  };

  const initials = getInitials(user?.full_name);

  return (
    <div className="sd-wrapper">
      {/* ── Header ── */}
      <header className="sd-header">
        <div className="sd-header-content">
          {/* Logo */}
          <h1 className="sd-logo" onClick={handleLogoClick}>
            <img src={logo} alt="Krayonads LMS" className="sd-logo-img" />
          </h1>

          {/* Right side nav */}
          <div className="sd-user-menu">
            {/* Avatar + Name chip — clicking goes to Profile tab */}
            <button
              className="sd-avatar-chip"
              onClick={() => {
                setActiveTab('profile');
                setSelectedCourseId(null);
              }}
            >
              <div className="sd-avatar">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt="Profile" />
                ) : initials ? (
                  <span>{initials}</span>
                ) : (
                  <User size={16} />
                )}
              </div>
              <div className="sd-avatar-text">
                <span className="sd-avatar-name">{user?.full_name || user?.email}</span>
                <span className="sd-avatar-role">View profile</span>
              </div>
              <ChevronDown size={15} className="sd-avatar-chevron" />
            </button>

            <div className="sd-user-menu-divider" />

            {/* Logout button */}
            <button onClick={logout} className="sd-logout-btn" title="Log out">
              <LogOut size={17} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="sd-main">
        {/* Tab navigation — hidden while viewing a course */}
        {!selectedCourseId && (
          <div className="sd-tabs">
            <button
              className={`sd-tab ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <BookOpen size={17} /> My Courses
            </button>
            <button
              className={`sd-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Settings size={17} /> Profile
            </button>
          </div>
        )}

        {/* Page content */}
        {!selectedCourseId ? (
          activeTab === 'courses' ? (
            <div className="animate-fade-in">
              <div className="sd-hero">
                <div className="sd-hero-copy">
                  <span className="sd-hero-eyebrow">Student Dashboard</span>
                  <h2 className="sd-hero-title">
                    Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
                  </h2>
                  <p className="sd-hero-subtitle">
                    Pick up right where you left off and continue your learning journey.
                  </p>
                </div>

                <div className="sd-hero-panel">
                  <div className="sd-hero-panel-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="sd-hero-panel-title">Stay consistent</div>
                  <div className="sd-hero-panel-text">
                    A little progress each day adds up to real skills. Keep going!
                  </div>
                </div>
              </div>

              <div className="sd-section-header">
                <h3>My Enrolled Courses</h3>
              </div>

              <MyCourses onSelectCourse={setSelectedCourseId} />
            </div>
          ) : (
            <ProfileView />
          )
        ) : (
          <CourseViewer courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />
        )}
      </main>
    </div>
  );
}