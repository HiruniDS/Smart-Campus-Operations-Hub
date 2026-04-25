import { useEffect, useState, useCallback } from 'react';
import { fetchAllBookings, approveBooking, rejectBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BookingTable from '../../components/booking/BookingTable';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import { ApprovalModal, RejectionModal } from '../../components/booking/BookingActionModals';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';
import { BkBtn, BkServerError } from '../../components/booking/BkUI';

export default function AdminBookingReviewPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect non‑admins safely via useEffect
  useEffect(() => {
    if (currentUser.role !== 'ADMIN') {
      navigate('/bookings');
    }
  }, [currentUser.role, navigate]);

  // Prevent rendering before redirect
  if (currentUser.role !== 'ADMIN') return null;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    bookingDate: '',
    requestedBy: '',
    resourceId: '',
  });
  const [toast, setToast] = useState('');

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v)
      );
      const data = await fetchAllBookings(activeFilters);
      setBookings(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

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
    } finally {
      setActionLoading(false);
    }
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
    } finally {
      setActionLoading(false);
    }
  };

  // Admin-specific row actions
  const adminActions = (booking) => {
    if (booking.status !== 'PENDING') return null;
    return (
      <>
        <BkBtn
          variant="success"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            setApproveTarget(booking.id);
          }}
        >
          Approve
        </BkBtn>
        <BkBtn
          variant="danger"
          size="xs"
          onClick={(e) => {
            e.preventDefault();
            setRejectTarget(booking.id);
          }}
        >
          Reject
        </BkBtn>
      </>
    );
  };

  // Count pending for quick info
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* ── Toast notification ──────────────────────── */}
      {toast && (
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-2xl z-50 flex items-center gap-2 animate-[slideUpToast_0.3s_ease-out]">
          <span className="text-lg">✅</span>
          <span>{toast}</span>
        </div>
      )}

      {/* ── Page header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Booking Review
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-indigo-200/70">
              Admin
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Review and process all campus resource booking requests.
          </p>
          {pendingCount > 0 && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              ⏳ {pendingCount} booking{pendingCount > 1 ? 's' : ''} awaiting action
            </p>
          )}
        </div>
        <BkBtn variant="outline" onClick={load}>
          <span className="text-base">↻</span> Refresh
        </BkBtn>
      </div>

      {/* ── Summary cards ───────────────────────────── */}
      {!loading && !error && <BookingSummaryCards bookings={bookings} />}

      {/* ── Filter bar (self‑contained card) ────────── */}
      <BookingFilterBar
        filters={filters}
        onChange={setFilters}
        showRequesterFilter
      />

      {/* ── Global error ────────────────────────────── */}
      <BkServerError message={error} />

      {/* ── Content states ──────────────────────────── */}
      {loading && <LoadingState message="Fetching all bookings…" />}
      {!loading && !error && bookings.length === 0 && (
        <EmptyState message="No bookings match the current filters." icon="📋" />
      )}
      {!loading && !error && bookings.length > 0 && (
        <BookingTable bookings={bookings} actions={adminActions} />
      )}

      {/* ── Modals ──────────────────────────────────── */}
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