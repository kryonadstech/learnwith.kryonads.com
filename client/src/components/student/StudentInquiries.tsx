import { useState, useEffect } from 'react';
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

  return (
    <div className="sd-card sd-card-full">
      <div className="sd-card-header">
        <h3>My Inquiries</h3>
      </div>
      <div className="sd-card-body">
        <table className="sd-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Message</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>{inquiry.created_at}</td>
                <td>{inquiry.course_interest || 'General'}</td>
                <td>{inquiry.message || 'No message provided'}</td>
                <td>{inquiry.is_resolved ? 'Resolved' : 'Open'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
