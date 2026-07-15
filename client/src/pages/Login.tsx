import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/users/auth/student/request-otp/', { email });
      setStep(2);
      setMessage('OTP sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP. Ensure you have an active account.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/users/auth/student/verify-otp/', { email, code: otp });
      login(response.data.token, response.data.user);
      // ProtectedRoute will automatically redirect to student dashboard
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="glass-panel p-8 w-full max-w-md animate-fade-in" style={{ maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Student Login</h2>
          <p className="text-secondary text-sm">Enter your email to receive a login code</p>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-[var(--error)] bg-opacity-20 text-[var(--error)] text-sm border border-[var(--error)] border-opacity-50">{error}</div>}
        {message && <div className="mb-4 p-3 rounded bg-[var(--success)] bg-opacity-20 text-[var(--success)] text-sm border border-[var(--success)] border-opacity-50">{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp}>
            <div className="input-group">
              <label className="input-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <label className="input-label" htmlFor="otp">6-Digit Code</label>
              <input
                id="otp"
                type="text"
                className="input-field text-center tracking-widest text-lg font-mono"
                placeholder="------"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary w-full text-sm" 
              onClick={() => { setStep(1); setOtp(''); }}
              disabled={loading}
            >
              Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
