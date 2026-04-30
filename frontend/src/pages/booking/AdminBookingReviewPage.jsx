import { useEffect, useState, useCallback } from 'react';
import { fetchAllBookings, approveBooking, rejectBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import BookingTable from '../../components/booking/BookingTable';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import { ApprovalModal, RejectionModal } from '../../components/booking/BookingActionModals';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';
import { BkServerError } from '../../components/booking/BkUI';

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .ar-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }

  @keyframes arFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ar-u0 { animation: arFadeUp .35s ease both; }
  .ar-u1 { animation: arFadeUp .35s .07s ease both; }
  .ar-u2 { animation: arFadeUp .35s .14s ease both; }
  .ar-u3 { animation: arFadeUp .35s .21s ease both; }
  .ar-u4 { animation: arFadeUp .35s .28s ease both; }

  /* Toast */
  @keyframes arSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ar-toast {
    animation: arSlideUp .3s ease both;
    position: fixed; bottom: 32px; right: 32px; z-index: 50;
    display: flex; align-items: center; gap: 10px;
    padding: 14px 20px; border-radius: 16px;
    background: #0C1D11; color: #fff;
    font-size: 13px; font-weight: 600; font-family: inherit;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    border: 1px solid rgba(16,185,129,0.3);
  }
  .ar-toast-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10B981; flex-shrink: 0;
    box-shadow: 0 0 8px rgba(16,185,129,0.6);
  }

  /* Refresh button */
  .ar-refresh {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 12px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #fff; color: #374151;
    border: 1.5px solid #E5E7EB;
    transition: background .15s, transform .15s, border-color .15s;
  }
  .ar-refresh:hover {
    background: #F0FDF4; border-color: #A7F3D0;
    color: #059669; transform: translateY(-1px);
  }

  /* Pending alert strip */
  .ar-pending-strip {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; border-radius: 10px;
    background: #FFFBEB; border: 1.5px solid #FDE68A;
    font-size: 12px; font-weight: 600; color: #92400E;
  }

  /* Action buttons inside table */
  .ar-btn-approve {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 9px; cursor: pointer;
    font-size: 12px; font-weight: 700; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    color: #fff; border: none;
    box-shadow: 0 2px 8px rgba(16,185,129,0.28);
    transition: filter .15s, transform .15s;
  }
  .ar-btn-approve:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .ar-btn-reject {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 9px; cursor: pointer;
    font-size: 12px; font-weight: 700; font-family: inherit;
    background: #FFF1F2; color: #E11D48;
    border: 1.5px solid #FECDD3;
    transition: background .15s, transform .15s;
  }
  .ar-btn-reject:hover { background: #FFE4E6; transform: translateY(-1px); }

  .ar-btn-view {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 14px; border-radius: 9px; cursor: pointer;
    font-size: 12px; font-weight: 700; font-family: inherit;
    background: #F8FAFC; color: #6B7280;
    border: 1.5px solid #E5E7EB;
    transition: background .15s, transform .15s;
    text-decoration: none;
  }
  .ar-btn-view:hover { background: #F0FDF4; border-color: #A7F3D0; color: #059669; transform: translateY(-1px); }
`;

/* ── Admin guard ─────────────────────────────────────────── */
function AdminGuard({ children }) {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  useEffect(() => {
    if (currentUser.role !== 'ADMIN') navigate('/bookings');
  }, [currentUser.role, navigate]);
  if (currentUser.role !== 'ADMIN') return null;
  return children;
}

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
function AdminBookingReviewPageInner() {
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [filters,       setFilters]       = useState({ status: '', bookingDate: '', requestedBy: '', resourceId: '' });
  const [toast,         setToast]         = useState('');
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget,  setRejectTarget]  = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      setBookings(await fetchAllBookings(activeFilters));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings.');
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleApprove = async (reviewReason) => {
    setActionLoading(true);
    try {
      await approveBooking(approveTarget, reviewReason);
      showToast('Booking approved successfully.');
      setApproveTarget(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Approval failed.');
      setApproveTarget(null);
    } finally { setActionLoading(false); }
  };

  const handleReject = async (reason) => {
    setActionLoading(true);
    try {
      await rejectBooking(rejectTarget, reason);
      showToast('Booking rejected.');
      setRejectTarget(null);
      load();
    } catch (err) {
      setError(err?.response?.data?.message || 'Rejection failed.');
      setRejectTarget(null);
    } finally { setActionLoading(false); }
  };

  /* ── Row action buttons ── */
  const adminActions = (booking) => {
    if (booking.status !== 'PENDING') return null;
    return (
      <>
        <button className="ar-btn-approve"
          onClick={(e) => { e.preventDefault(); setApproveTarget(booking.id); }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Approve
        </button>
        <button className="ar-btn-reject"
          onClick={(e) => { e.preventDefault(); setRejectTarget(booking.id); }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Reject
        </button>
      </>
    );
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="ar-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      {/* ── Toast ──────────────────────────────────────── */}
      {toast && (
        <div className="ar-toast">
          <span className="ar-toast-dot" />
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ───────────────────────────────── */}
        <nav className="ar-u0 flex items-center gap-1.5 text-xs mb-6">
          <Link to="/bookings" className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#059669' }}>Dashboard</Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">Review Bookings</span>
        </nav>

        {/* ── Page header ──────────────────────────────── */}
        <div className="ar-u1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-6">
          <div>
            {/* Admin console pill — matches dashboard hero */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#7C3AED' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Admin Console
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
              style={{ color: '#0C1D11' }}>
              Booking Review
            </h1>
            <p className="text-sm mb-3" style={{ color: '#6B7280' }}>
              Review and process all campus resource booking requests.
            </p>

            {/* Pending alert strip */}
            {pendingCount > 0 && (
              <div className="ar-pending-strip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {pendingCount} booking{pendingCount > 1 ? 's' : ''} awaiting action
              </div>
            )}
          </div>

          {/* Refresh */}
          <button className="ar-refresh shrink-0" onClick={load}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* ── Summary cards ────────────────────────────── */}
        {!loading && !error && (
          <div className="ar-u2 mb-5">
            <BookingSummaryCards bookings={bookings} />
          </div>
        )}

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="ar-u3 mb-5">
          <BookingFilterBar filters={filters} onChange={setFilters} showRequesterFilter />
        </div>

        {/* ── Server error ─────────────────────────────── */}
        <BkServerError message={error} />

        {/* ── Content states ───────────────────────────── */}
        {loading && <LoadingState message="Fetching all bookings…" />}
        {!loading && !error && bookings.length === 0 && (
          <EmptyState message="No bookings match the current filters." />
        )}

        {/* ── Table ────────────────────────────────────── */}
        {!loading && !error && bookings.length > 0 && (
          <div className="ar-u4 rounded-2xl overflow-hidden bg-white"
            style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

            {/* Table header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '15px 22px', borderBottom: '1px solid #F0EDE6',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 3, height: 16, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151' }}>
                  All Bookings
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: '#F0FDF4', color: '#059669',
                  border: '1px solid #A7F3D0', borderRadius: 99,
                  padding: '1px 9px',
                }}>
                  {bookings.length}
                </span>
              </div>
              {pendingCount > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  background: '#FFFBEB', color: '#D97706',
                  border: '1px solid #FDE68A', borderRadius: 99,
                  padding: '3px 10px',
                }}>
                  {pendingCount} pending
                </span>
              )}
            </div>

            <BookingTable bookings={bookings} actions={adminActions} />
          </div>
        )}

      </div>

      {/* ── Modals ─────────────────────────────────────── */}
      {approveTarget && (
        <ApprovalModal
          onConfirm={handleApprove}
          onClose={() => setApproveTarget(null)}
          loading={actionLoading}
        />
      )}
      {rejectTarget && (
        <RejectionModal
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}


export default function AdminBookingReviewPage() {
  return (
    <AdminGuard>
      <AdminBookingReviewPageInner />
    </AdminGuard>
  );
}