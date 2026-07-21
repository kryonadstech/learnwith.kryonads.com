import { useState, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Camera, Save, Loader2, User } from 'lucide-react';

export default function ProfileView() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.profile_photo || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const submitData = new FormData();
    submitData.append('full_name', formData.full_name);
    submitData.append('phone_number', formData.phone_number);
    submitData.append('address', formData.address);
    if (photoFile) {
      submitData.append('profile_photo', photoFile);
    }

    try {
      const response = await api.put('/users/auth/profile/update/', submitData);
      // Instantly update the header name, photo, etc
      updateUser(response.data);
      // Also sync form state in case server returned different data
      setFormData({
        full_name: response.data.full_name || '',
        phone_number: response.data.phone_number || '',
        address: response.data.address || '',
      });
      if (response.data.profile_photo) {
        setPhotoPreview(response.data.profile_photo);
      }
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="sd-card animate-fade-in"
      style={{ maxWidth: '800px', margin: '0 auto', cursor: 'default' }}
    >
      <h3
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '2rem',
          borderBottom: '1px solid var(--sd-glass-border)',
          paddingBottom: '1rem',
          color: 'var(--sd-text)',
        }}
      >
        My Profile
      </h3>

      {message.text && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '0.75rem',
            background: message.type === 'success' ? 'var(--sd-success-bg)' : 'var(--sd-error-bg)',
            color: message.type === 'success' ? 'var(--sd-success)' : 'var(--sd-error)',
            border: `1px solid ${message.type === 'success' ? 'var(--sd-success-border)' : 'var(--sd-error-border)'}`,
            fontWeight: 600,
            fontSize: '0.9rem',
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {/* Photo Upload Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--sd-accent-tint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--sd-accent-glow)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={48} color="var(--sd-accent)" />
              )}
            </div>

            <button type="button" className="sd-btn sd-btn-icon" onClick={() => fileInputRef.current?.click()}>
              <Camera size={16} /> Change Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* Form Fields */}
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--sd-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                Email Address (Cannot be changed)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.6rem',
                  background: '#F1F5F9',
                  border: '1px solid var(--sd-glass-border)',
                  color: 'var(--sd-text-muted)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--sd-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.6rem',
                  background: '#F8FAFC',
                  border: '1px solid var(--sd-glass-border)',
                  color: 'var(--sd-text)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--sd-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.6rem',
                  background: '#F8FAFC',
                  border: '1px solid var(--sd-glass-border)',
                  color: 'var(--sd-text)',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--sd-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Learning St, Tech City"
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.6rem',
                  background: '#F8FAFC',
                  border: '1px solid var(--sd-glass-border)',
                  color: 'var(--sd-text)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--sd-glass-border)', paddingTop: '1.5rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, var(--sd-accent) 0%, var(--sd-accent-dark) 100%)',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.6rem',
              border: 'none',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 8px 20px rgba(29, 71, 156, 0.25)',
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}