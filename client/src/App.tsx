import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import './styles/global.css';

// If authenticated, redirect away from public pages to the right dashboard
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (user) {
    if (user.is_staff) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/';
      const adminUrl = baseUrl.includes('/api/v1') ? baseUrl.replace('/api/v1/', '/admin/') : 'http://localhost:8000/admin/';
      window.location.href = adminUrl;
      return null;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Block unauthenticated users and route by role
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (requireAdmin && !user.is_staff) return <Navigate to="/dashboard" replace />;
  if (!requireAdmin && user.is_staff) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/';
      const adminUrl = baseUrl.includes('/api/v1') ? baseUrl.replace('/api/v1/', '/admin/') : 'http://localhost:8000/admin/';
      window.location.href = adminUrl;
      return null;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public: Landing page — if logged in, redirects to dashboard */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

          {/* Public: Auth pages — also redirect if already logged in */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />


          {/* Protected: Student dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: send to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
