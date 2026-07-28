import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { isAxiosError } from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/users/auth/admin/login/', { email, password });
      login(response.data.token, response.data.user);
      // ProtectedRoute will redirect to admin dashboard
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error || 'Invalid admin credentials.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="glass-panel p-8 w-full max-w-md animate-fade-in" style={{ maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-[var(--accent-primary)]">Admin Portal</h2>
          <p className="text-secondary text-sm">Sign in to manage the LMS</p>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-[var(--error)] bg-opacity-20 text-[var(--error)] text-sm border border-[var(--error)] border-opacity-50">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Admin Email</label>
            <input
              id="email"
              type="email"
              className="input-field"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
