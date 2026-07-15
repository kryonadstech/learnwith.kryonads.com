import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, ShieldAlert, Key } from 'lucide-react';

interface Student {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/lms/admin/students/');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDevice = async (studentId: string) => {
    if (!confirm("Are you sure you want to reset this student's device lock? This will log them out of all active sessions.")) return;
    
    try {
      await api.post(`/lms/admin/students/${studentId}/reset_device/`);
      alert("Device lock reset successfully.");
    } catch (error) {
      console.error('Failed to reset device', error);
      alert("Failed to reset device lock.");
    }
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users size={20} className="text-[var(--accent-primary)]" />
          Student Management
        </h2>
        {/* Placeholder for Add Student modal / page */}
        <button className="btn btn-secondary text-sm px-4 py-2">
          Add Student
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--glass-border)] bg-[rgba(0,0,0,0.2)]">
              <th className="p-4 font-medium text-secondary text-sm">Email</th>
              <th className="p-4 font-medium text-secondary text-sm">Status</th>
              <th className="p-4 font-medium text-secondary text-sm">Joined</th>
              <th className="p-4 font-medium text-secondary text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-b border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="p-4">{student.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${student.is_active ? 'bg-[var(--success)] bg-opacity-20 text-[var(--success)]' : 'bg-[var(--error)] bg-opacity-20 text-[var(--error)]'}`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-sm text-secondary">
                  {new Date(student.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleResetDevice(student.id)}
                    className="text-secondary hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1 ml-auto text-xs"
                    title="Reset Device Lock"
                  >
                    <Key size={14} /> Reset Device
                  </button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-secondary border-dashed">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 border border-[var(--accent-primary)] bg-[var(--accent-light)] rounded-lg flex items-start gap-3">
        <ShieldAlert className="text-[var(--accent-primary)] shrink-0 mt-0.5" size={18} />
        <div className="text-sm">
          <strong className="block mb-1 text-[var(--text-primary)]">About Device Locks</strong>
          <span className="text-secondary">When a student logs into a new device, their old session is automatically invalidated. The "Reset Device" button is only needed if a student is completely locked out due to a support issue (e.g. lost phone and new login failing, though our current setup auto-handles most cases).</span>
        </div>
      </div>
    </div>
  );
}
