import { useState, useEffect } from 'react';
import api from '../../api/axios';
import logo from '../../assets/logo.png';
import { CreditCard, FileText, Calendar, CheckCircle, AlertCircle, Printer } from 'lucide-react';

interface PaymentRecord {
  id: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  reference_id: string;
  remarks: string;
}

interface CourseSummary {
  id: string;
  title: string;
  price: string;
}

interface Enrollment {
  id: string;
  course: CourseSummary;
  course_fee: string;
  total_paid: string;
  balance_amount: string;
  payment_status: string;
  user_email: string;
  user_full_name?: string;
  payment_records: PaymentRecord[];
}

// Format a decimal string as a localized Indian rupee figure
function fmt(val: string | number | undefined): string {
  const n = parseFloat(String(val ?? '0'));
  return isNaN(n) ? '0.00' : n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function createReceiptHtml(payment: PaymentRecord, enrollment: Enrollment) {
  const studentName = enrollment.user_full_name?.trim() || enrollment.user_email || 'Student';
  const date = new Date(payment.payment_date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const amount = `₹${fmt(payment.amount)}`;
  const courseFee = `₹${fmt(enrollment.course_fee)}`;
  const totalPaid = `₹${fmt(enrollment.total_paid)}`;
  const balance = `₹${fmt(enrollment.balance_amount)}`;
  const receiptNumber = payment.reference_id || payment.id.slice(0, 8).toUpperCase();
  const logoSrc = logo;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Payment Receipt</title>
  <style>
    @page { size: A4 portrait; margin: 18mm; }
    html, body { margin: 0; padding: 0; }
    body { background: #f3f4f6; font-family: Inter, system-ui, sans-serif; color: #111827; font-size: 13px; }
    .receipt { max-width: 760px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 80px rgba(15,23,42,.12); }
    .header { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 22px 24px 14px; background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%); color: #ffffff; }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand-mark { width: 180px; height: 54px; border-radius: 18px; background: rgba(255,255,255,.18); display: grid; place-items: center; overflow: hidden; padding: 8px; }
    .brand-mark img { width: 100%; height: 100%; object-fit: contain; }
    .brand-text { display: none; }
    .receipt-meta { text-align: right; }
    .receipt-meta .label { display: block; font-size: 0.72rem; color: rgba(255,255,255,.85); text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 0.35rem; }
    .receipt-meta .value { font-size: 0.94rem; font-weight: 700; line-height: 1.2; }
    .body { padding: 22px 24px 28px; }
    .section { margin-bottom: 22px; }
    .section h2 { margin: 0 0 14px; font-size: 0.96rem; letter-spacing: -0.02em; color: #111827; }
    .details, .summary { width: 100%; border-collapse: collapse; }
    .details td, .summary td { padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem; }
    .details td.label, .summary td.label { color: #6b7280; width: 160px; vertical-align: top; }
    .details td.value, .summary td.value { color: #111827; font-weight: 600; }
    .summary { margin-top: 8px; }
    .summary tr:last-child td { border-bottom: none; }
    .summary td.value { text-align: right; }
    .summary td.value.positive { color: #059669; }
    .summary td.value.warning { color: #b45309; }
    .footer { margin-top: 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .note { max-width: 68%; color: #4b5563; font-size: 0.84rem; line-height: 1.5; }
    .stamp { padding: 10px 16px; border-radius: 999px; background: #ecfdf5; color: #166534; font-size: 0.82rem; font-weight: 700; letter-spacing: 0.04em; }
    @media print {
      body { padding: 0; background: #fff; }
      .receipt { box-shadow: none; border-radius: 0; }
      .footer { margin-top: 20px; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="brand">
        <div class="brand-mark"><img src="${logoSrc}" alt="Kryon" /></div>
      </div>
      <div class="receipt-meta">
        <span class="label">Receipt</span>
        <span class="value">#${receiptNumber}</span>
        <span class="label">Date</span>
        <span class="value">${date}</span>
      </div>
    </div>

    <div class="body">
      <div class="section">
        <h2>Student Information</h2>
        <table class="details">
          <tr><td class="label">Student name</td><td class="value">${studentName}</td></tr>
          <tr><td class="label">Email</td><td class="value">${enrollment.user_email}</td></tr>
          <tr><td class="label">Course</td><td class="value">${enrollment.course.title}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Payment Details</h2>
        <table class="details">
          <tr><td class="label">Payment status</td><td class="value">${enrollment.payment_status.replace(/^[a-z]/, (c) => c.toUpperCase())}</td></tr>
          <tr><td class="label">Payment method</td><td class="value">${payment.payment_method.replace(/^[a-z]/, (c) => c.toUpperCase())}</td></tr>
          <tr><td class="label">Reference ID</td><td class="value">${payment.reference_id || 'N/A'}</td></tr>
          <tr><td class="label">Remarks</td><td class="value">${payment.remarks || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Amount Summary</h2>
        <table class="summary">
          <tr><td class="label">Course fee</td><td class="value">${courseFee}</td></tr>
          <tr><td class="label">Total paid</td><td class="value positive">${totalPaid}</td></tr>
          <tr><td class="label">Balance due</td><td class="value ${enrollment.balance_amount && Number(enrollment.balance_amount) > 0 ? 'warning' : 'positive'}">${balance}</td></tr>
          <tr><td class="label">This payment</td><td class="value positive">${amount}</td></tr>
        </table>
      </div>

      <div class="footer">
        <div class="note">This receipt is generated from your student portal. Please keep it for future reference and contact support if you need any assistance.</div>
        <div class="stamp">Paid</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function printReceipt(payment: PaymentRecord, enrollment: Enrollment) {
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) return;
  printWindow.document.write(createReceiptHtml(payment, enrollment));
  printWindow.document.close();
  printWindow.focus();
  printWindow.onload = () => {
    printWindow.print();
  };
}

export default function MyPayments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get('/lms/student/enrollments/');
        setEnrollments(response.data);
      } catch (err) {
        console.error('Failed to fetch enrollments and payments', err);
        setError('Failed to load payment records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--sd-text-muted)', padding: '2rem 0' }}>
        <span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid var(--sd-accent)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        Loading your payment records…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: 'var(--sd-error-bg)', color: 'var(--sd-error)', border: '1px solid var(--sd-error-border)', fontWeight: 600 }}>
        {error}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div style={{ background: 'var(--sd-surface)', border: '1px solid var(--sd-glass-border)', padding: '3rem', textAlign: 'center', borderRadius: '1.25rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--sd-text)' }}>No Records</h3>
        <p style={{ color: 'var(--sd-text-muted)' }}>You have no enrollment or payment records yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {enrollments.map((enr) => {
        // course_fee is the admin-set agreed fee; fall back to course.price if not set
        const agreedFee   = parseFloat(enr.course_fee || enr.course.price || '0');
        const totalPaid   = parseFloat(enr.total_paid || '0');
        const balance     = parseFloat(enr.balance_amount || '0');
        const isFullyPaid = balance <= 0;
        const paidPct     = agreedFee > 0 ? Math.min((totalPaid / agreedFee) * 100, 100) : 100;

        return (
          <div key={enr.id} className="sd-card animate-fade-in" style={{ cursor: 'default' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--sd-glass-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--sd-text)', marginBottom: '0.35rem' }}>
                  {enr.course.title}
                </h3>
                <p style={{ color: 'var(--sd-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  Payment Status: <strong style={{ textTransform: 'capitalize', color: 'var(--sd-text)' }}>{enr.payment_status}</strong>
                </p>
              </div>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 700, fontSize: '0.82rem',
                  background: isFullyPaid ? 'var(--sd-success-bg)' : '#FEF3C7',
                  color: isFullyPaid ? 'var(--sd-success)' : '#B45309',
                  border: `1px solid ${isFullyPaid ? 'var(--sd-success-border)' : '#FDE68A'}`,
                }}
              >
                {isFullyPaid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {isFullyPaid ? 'Fully Paid' : 'Balance Due'}
              </span>
            </div>

            {/* ── Fee Summary Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Course Fee', value: `₹${fmt(agreedFee)}`, color: 'var(--sd-text)' },
                { label: 'Total Paid', value: `₹${fmt(totalPaid)}`, color: 'var(--sd-success)' },
                { label: 'Balance Due', value: `₹${fmt(balance)}`, color: balance > 0 ? '#D97706' : 'var(--sd-success)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: 'var(--sd-surface)', border: '1px solid var(--sd-glass-border)', borderRadius: '0.75rem', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--sd-text-muted)', fontWeight: 600, margin: '0 0 0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 800, color, margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>

            {/* ── Progress Bar ── */}
            {agreedFee > 0 && (
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--sd-text-muted)', marginBottom: '0.4rem' }}>
                  <span>Payment Progress</span>
                  <span>{paidPct.toFixed(0)}% paid</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'var(--sd-glass-border)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${paidPct}%`, borderRadius: 999, background: isFullyPaid ? 'var(--sd-success)' : 'linear-gradient(90deg, var(--sd-accent), var(--sd-accent-dark))', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )}

            {/* ── Payment History Table ── */}
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--sd-text)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={15} /> Payment History
            </h4>

            {enr.payment_records && enr.payment_records.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '0.75rem', border: '1px solid var(--sd-glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--sd-surface)', textAlign: 'left' }}>
                      {['Date', 'Amount', 'Method', 'Reference ID', 'Remarks', 'Receipt'].map((h) => (
                        <th key={h} style={{ padding: '0.75rem 1rem', color: 'var(--sd-text-muted)', fontWeight: 600, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {enr.payment_records.map((payment, idx) => (
                      <tr key={payment.id} style={{ borderTop: '1px solid var(--sd-glass-border)', background: idx % 2 === 0 ? 'transparent' : 'var(--sd-surface)' }}>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--sd-text)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={13} color="var(--sd-text-muted)" />
                            {new Date(payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: 'var(--sd-success)', whiteSpace: 'nowrap' }}>
                          ₹{fmt(payment.amount)}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--sd-text)', textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CreditCard size={13} color="var(--sd-text-muted)" />
                            {payment.payment_method === 'upi' ? 'UPI' : payment.payment_method === 'bank' ? 'Bank Transfer' : payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--sd-text-muted)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {payment.reference_id || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--sd-text-muted)', fontSize: '0.85rem' }}>
                          {payment.remarks || '—'}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', whiteSpace: 'nowrap' }}>
                          <button
                            type="button"
                            onClick={() => printReceipt(payment, enr)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.5rem 0.85rem', borderRadius: '999px', border: '1px solid rgba(59,130,246,0.2)',
                              background: '#eff6ff', color: '#2563eb', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', transition: 'background 0.2s ease',
                            }}
                          >
                            <Printer size={14} /> Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--sd-surface)', borderRadius: '0.75rem', border: '1px solid var(--sd-glass-border)' }}>
                <p style={{ color: 'var(--sd-text-muted)', fontSize: '0.9rem', margin: 0 }}>No payments have been recorded yet.</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
