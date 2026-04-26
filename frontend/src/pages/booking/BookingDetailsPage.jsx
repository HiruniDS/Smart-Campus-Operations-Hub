import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBookingById, cancelBooking, deleteBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { CancellationModal } from '../../components/booking/BookingActionModals';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';
import { BkServerError } from '../../components/booking/BkUI';
import detailsStatusHeader from '../../assets/booking/booking-details-status-header.png';

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .bd-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }

  @keyframes bdFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bd-u0 { animation: bdFadeUp .35s ease both; }
  .bd-u1 { animation: bdFadeUp .35s .07s ease both; }
  .bd-u2 { animation: bdFadeUp .35s .14s ease both; }
  .bd-u3 { animation: bdFadeUp .35s .21s ease both; }
  .bd-u4 { animation: bdFadeUp .35s .28s ease both; }

  .bd-row {
    display: flex; align-items: baseline; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid #F5F3EE;
  }
  .bd-row:last-child { border-bottom: none; }
  .bd-row-label {
    font-size: 10px; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.14em; color: #9CA3AF;
    min-width: 120px; flex-shrink: 0;
  }
  .bd-row-value {
    font-size: 13px; color: #111827; font-weight: 500; word-break: break-word;
  }

  .bd-btn-cancel {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #FFF1F2; color: #E11D48;
    border: 1.5px solid #FECDD3;
    transition: background .15s, transform .15s;
  }
  .bd-btn-cancel:hover { background: #FFE4E6; transform: translateY(-1px); }

  .bd-btn-delete {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #F8FAFC; color: #6B7280;
    border: 1.5px solid #E5E7EB;
    transition: background .15s, transform .15s;
  }
  .bd-btn-delete:hover { background: #F1F5F9; transform: translateY(-1px); }
`;

/* ─── Status banner config ────────────────────────────────── */
const STATUS_BANNER = {
  PENDING: {
    bg: '#FFFBEB', border: '#FDE68A', text: '#92400E',
    iconBg: '#FEF3C7', iconColor: '#D97706',
    message: 'This booking is awaiting admin review.',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>),
  },
  APPROVED: {
    bg: '#F0FDF4', border: '#A7F3D0', text: '#065F46',
    iconBg: '#D1FAE5', iconColor: '#059669',
    message: 'This booking has been approved and confirmed.',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>),
  },
  REJECTED: {
    bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239',
    iconBg: '#FFE4E6', iconColor: '#E11D48',
    message: 'This booking request was rejected by an admin.',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>),
  },
  CANCELLED: {
    bg: '#F8FAFC', border: '#E2E8F0', text: '#475569',
    iconBg: '#F1F5F9', iconColor: '#64748B',
    message: 'This booking has been cancelled.',
    icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>),
  },
};

/* ─── Section card ────────────────────────────────────────── */
function SectionCard({ icon, title, children, fullWidth = false }) {
  return (
    <div className={`rounded-2xl bg-white overflow-hidden ${fullWidth ? 'md:col-span-2' : ''}`}
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 22px', borderBottom: '1px solid #F0EDE6' }}>
        <div style={{ width: 3, height: 16, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        <h3 style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151', margin: 0 }}>
          {title}
        </h3>
      </div>
      <div style={{ padding: '16px 22px' }}>{children}</div>
    </div>
  );
}

/* ─── Info row ────────────────────────────────────────────── */
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="bd-row">
      <span className="bd-row-label">{label}</span>
      <span className="bd-row-value">{value}</span>
    </div>
  );
}

/* ─── Shell for loading/error states ─────────────────────── */
function Shell({ children }) {
  return (
    <div className="bd-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function BookingDetailsPage() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin         = currentUser.role === 'ADMIN';

  const [booking,         setBooking]         = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading,   setActionLoading]   = useState(false);
  const [actionError,     setActionError]     = useState('');
  const [successMsg,      setSuccessMsg]      = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try   { setBooking(await fetchBookingById(id)); }
    catch (err) { setError(err?.response?.data?.message || 'Booking not found.'); }
    finally     { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const handleCancel = async (reason) => {
    setActionLoading(true); setActionError('');
    try {
      setBooking(await cancelBooking(id, reason));
      setShowCancelModal(false);
      setSuccessMsg('Booking cancelled successfully.');
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Cancellation failed.');
    } finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this booking request? This is permanent.')) return;
    try   { await deleteBooking(id); navigate('/bookings/me'); }
    catch (err) { setActionError(err?.response?.data?.message || 'Delete failed.'); }
  };

  if (loading) return <Shell><LoadingState message="Loading booking details…" /></Shell>;
  if (error)   return <Shell><ErrorState message={error} onRetry={load} /></Shell>;
  if (!booking) return null;

  const banner    = STATUS_BANNER[booking.status] || STATUS_BANNER.PENDING;
  const canCancel = booking.status === 'PENDING' || booking.status === 'APPROVED';
  const canDelete = booking.status === 'PENDING' && booking.requestedBy === currentUser.username;

  return (
    <div className="bd-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="bd-u0 flex items-center gap-1.5 text-xs mb-5">
          <Link to="/bookings" className="font-semibold transition-opacity hover:opacity-70" style={{ color: '#059669' }}>Dashboard</Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <Link to={isAdmin ? '/bookings/admin' : '/bookings/me'} className="font-semibold transition-opacity hover:opacity-70" style={{ color: '#059669' }}>
            {isAdmin ? 'All Bookings' : 'My Bookings'}
          </Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">Details</span>
        </nav>

        {/* ── Lifecycle illustration ─────────────────── */}
        <div className="bd-u0 rounded-2xl overflow-hidden mb-5"
          style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <img src={detailsStatusHeader}
            alt="Booking lifecycle" loading="lazy"
            className="w-full object-cover object-center" style={{ height: 120 }} />
        </div>

        {/* ── Status banner ──────────────────────────── */}
        <div className="bd-u1 flex items-center gap-3 rounded-2xl px-5 py-4 mb-5"
          style={{ background: banner.bg, border: `1.5px solid ${banner.border}` }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: banner.iconBg, color: banner.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {banner.icon}
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: banner.text, margin: 0 }}>
            {banner.message}
          </p>
        </div>

        {/* ── Page header + actions ──────────────────── */}
        <div className="bd-u2 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-2"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Booking Details
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2" style={{ color: '#0C1D11' }}>
              {booking.resourceName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <BookingStatusBadge status={booking.status} />
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                Requested by <strong style={{ color: '#111827' }}>{booking.requestedBy}</strong>
              </span>
              <span style={{ color: '#D1D5DB' }}>·</span>
              <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#9CA3AF' }}>{booking.resourceId}</span>
            </div>
          </div>

          {(canCancel || canDelete) && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {canCancel && (
                <button className="bd-btn-cancel" onClick={() => setShowCancelModal(true)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                  Cancel Booking
                </button>
              )}
              {canDelete && (
                <button className="bd-btn-delete" onClick={handleDelete}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                  </svg>
                  Delete Request
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Feedback ───────────────────────────────── */}
        {successMsg && (
          <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5 mb-5"
            style={{ background: '#F0FDF4', border: '1.5px solid #A7F3D0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#065F46' }}>{successMsg}</span>
          </div>
        )}
        <BkServerError message={actionError} />

        {/* ── Info grid ──────────────────────────────── */}
        <div className="bd-u3 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Resource Information */}
          <SectionCard title="Resource Information"
            icon={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}>
            <InfoRow label="Resource ID"   value={booking.resourceId} />
            <InfoRow label="Resource Name" value={booking.resourceName} />
            <InfoRow label="Type"          value={booking.resourceType?.replace(/_/g, ' ')} />
            <InfoRow label="Location"      value={booking.location} />
          </SectionCard>

          {/* Schedule */}
          <SectionCard title="Schedule"
            icon={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}>
            <InfoRow label="Booking Date" value={booking.bookingDate} />
            <InfoRow label="Start Time"   value={booking.startTime} />
            <InfoRow label="End Time"     value={booking.endTime} />
            <InfoRow label="Attendees"    value={booking.expectedAttendees} />
          </SectionCard>

          {/* Purpose */}
          <SectionCard title="Purpose" fullWidth
            icon={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>}>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
              {booking.purpose}
            </p>
          </SectionCard>

          {/* Audit Trail */}
          <SectionCard title="Audit Trail" fullWidth
            icon={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="Created At"  value={booking.createdAt  ? new Date(booking.createdAt).toLocaleString()  : null} />
                <InfoRow label="Updated At"  value={booking.updatedAt  ? new Date(booking.updatedAt).toLocaleString()  : null} />
                {booking.reviewedBy && <InfoRow label="Reviewed By" value={booking.reviewedBy} />}
                {booking.reviewedAt && <InfoRow label="Reviewed At" value={new Date(booking.reviewedAt).toLocaleString()} />}
              </div>
              <div>
                {booking.reviewReason       && <InfoRow label="Review Note"         value={booking.reviewReason} />}
                {booking.cancelledBy        && <InfoRow label="Cancelled By"         value={booking.cancelledBy} />}
                {booking.cancelledAt        && <InfoRow label="Cancelled At"         value={new Date(booking.cancelledAt).toLocaleString()} />}
                {booking.cancellationReason && <InfoRow label="Cancellation Reason" value={booking.cancellationReason} />}
              </div>
            </div>
          </SectionCard>

        </div>
      </div>

      {showCancelModal && (
        <CancellationModal
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}