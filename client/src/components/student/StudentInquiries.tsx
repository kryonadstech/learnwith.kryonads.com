import { useState, useEffect } from 'react';
import { CheckCircle2, Clock3, MessageSquare } from 'lucide-react';
import api from '../../api/axios';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  course_interest: string;
  message: string;
  is_resolved: boolean;
  created_at: string;
}

export default function StudentInquiries() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await api.get('/users/inquiry/');
        setInquiries(response.data);
      } catch (err) {
        console.error('Failed to fetch inquiries', err);
        setError('Failed to load your inquiry history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  if (loading) {
    return <div className="sd-loading">Loading your inquiries…</div>;
  }

  if (error) {
    return <div className="sd-error">{error}</div>;
  }

  if (inquiries.length === 0) {
    return <div className="sd-empty">You have not submitted any inquiries yet.</div>;
  }

  const resolvedCount = inquiries.filter((inquiry) => inquiry.is_resolved).length;
  const openCount = inquiries.length - resolvedCount;

  return (
    <div className="sd-card sd-card-full sd-inquiries-card">
      <div className="sd-card-header">
        <div>
          <h3>My Inquiries</h3>
          <p className="sd-inquiry-summary">
            {inquiries.length} inquiry{inquiries.length === 1 ? '' : 'ies'} submitted
          </p>
        </div>
        <div className="sd-inquiry-overview">
          <MessageSquare size={18} />
          <span>
            {openCount} open · {resolvedCount} resolved
          </span>
        </div>
      </div>

      <div className="sd-card-body sd-inquiry-list">
        {inquiries.map((inquiry) => {
          const statusLabel = inquiry.is_resolved ? 'Resolved' : 'Open';
          const statusIcon = inquiry.is_resolved ? <CheckCircle2 size={16} /> : <Clock3 size={16} />;
          const statusClass = inquiry.is_resolved ? 'sd-badge-success' : 'sd-badge-pending';

          return (
            <article key={inquiry.id} className="sd-inquiry-item">
              <div className="sd-inquiry-meta">
                <div>
                  <p className="sd-inquiry-date">{inquiry.created_at}</p>
                  <p className="sd-inquiry-course">
                    Course: <strong>{inquiry.course_interest || 'General inquiry'}</strong>
                  </p>
                </div>
                <span className={`sd-badge-status ${statusClass}`}>
                  {statusIcon}
                  {statusLabel}
                </span>
              </div>

              <div className="sd-inquiry-message">
                {inquiry.message?.trim() ? inquiry.message : 'No message provided.'}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
