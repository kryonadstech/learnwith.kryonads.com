import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { login } = useAuth();

  // Inquiry Form State
  const [showInquiryForm, setShowInquiryForm] = useState(() => new URLSearchParams(window.location.search).get('enquire') === 'true');
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCourse, setInquiryCourse] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setShowInquiryForm(false);
    try {
      await api.post('/users/auth/student/request-otp/', { email });
      setStep(2);
      setMessage('OTP sent to your email.');
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 404) {
          setShowInquiryForm(true);
        } else {
          setError(err.response?.data?.error || 'Failed to send OTP. Ensure you have an active account.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
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
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error || 'Invalid or expired OTP.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users/inquiry/', {
        email,
        name: inquiryName,
        phone_number: inquiryPhone,
        course_interest: inquiryCourse,
        message: inquiryMessage
      });
      setShowInquiryForm(false);
      setMessage('Your inquiry has been submitted! We will contact you soon.');
      // Show success for 2 seconds then redirect to landing page
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to submit inquiry. Please try again later.');
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
          <h2 className="text-2xl font-bold mb-2">Student Login</h2>
          <p className="text-secondary text-sm">
            {showInquiryForm ? "Looks like you aren't enrolled yet. Register your interest below." : "Enter your email to receive a login code"}
          </p>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-[var(--error)] bg-opacity-20 text-[var(--error)] text-sm border border-[var(--error)] border-opacity-50">{error}</div>}
        {message && <div className="mb-4 p-3 rounded bg-[var(--success)] bg-opacity-20 text-[var(--success)] text-sm border border-[var(--success)] border-opacity-50">{message}</div>}

        {showInquiryForm ? (
          <form onSubmit={handleSubmitInquiry} className="animate-fade-in">
            <div className="input-group">
              <label className="input-label" htmlFor="inquiryEmail">Email Address</label>
              <input
                id="inquiryEmail"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="inquiryName">Full Name</label>
              <input
                id="inquiryName"
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={inquiryName}
                onChange={(e) => setInquiryName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="inquiryPhone">Phone Number</label>
              <input
                id="inquiryPhone"
                type="text"
                className="input-field"
                placeholder="+1 234 567 890"
                value={inquiryPhone}
                onChange={(e) => setInquiryPhone(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="inquiryCourse">Course of Interest</label>
              <select
                id="inquiryCourse"
                className="input-field"
                value={inquiryCourse}
                onChange={(e) => setInquiryCourse(e.target.value)}
                required
              >
                <option value="" disabled>Select a course</option>
                <option value="7 Days Meta Ads Crash Course">7 Days Meta Ads Crash Course</option>
                <option value="60 Days Digital Marketing Mastery Program">60 Days Digital Marketing Mastery Program</option>
                <option value="Other">Other (please specify in message)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="inquiryMessage">Message (Optional)</label>
              <textarea
                id="inquiryMessage"
                className="input-field"
                placeholder="Any questions or comments?"
                rows={3}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary w-full text-sm" 
              onClick={() => setShowInquiryForm(false)}
              disabled={loading}
            >
              Back to Login
            </button>
          </form>
        ) : step === 1 ? (
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
            <button type="submit" className="btn btn-primary w-full mb-4" disabled={loading}>
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary w-full" 
              style={{ fontSize: '0.875rem' }}
              onClick={() => setShowInquiryForm(true)}
              disabled={loading}
            >
              Not registered? Enquire here
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
