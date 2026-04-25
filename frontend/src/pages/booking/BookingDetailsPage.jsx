import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBookingById, cancelBooking, deleteBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { CancellationModal } from '../../components/booking/BookingActionModals';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';
import { BkBtn, BkCard, BkServerError, BkSuccessBanner } from '../../components/booking/BkUI';

// ── Status accent banner config ─────────────────────
const STATUS_BANNER = {
  PENDING: {
    bg: 'bg-amber-50/80 border-amber-200',
    text: 'text-amber-800',
    icon: '⏳',
    message: 'This booking is awaiting review.',
  },
  APPROVED: {
    bg: 'bg-emerald-50/80 border-emerald-200',
    text: 'text-emerald-800',
    icon: '✅',
    message: 'This booking has been approved.',
  },
  REJECTED: {
    bg: 'bg-rose-50/80 border-rose-200',
    text: 'text-rose-800',
    icon: '❌',
    message: 'This booking was rejected.',
  },
  CANCELLED: {
    bg: 'bg-slate-100/80 border-slate-200',
    text: 'text-slate-600',
    icon: '🚫',
    message: 'This booking has been cancelled.',
  },
};

// ── Info row with subtle icon dot ────────────────────
function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-baseline gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 min-w-[120px] shrink-0">
        {label}
      </span>
      <span className="text-sm text-slate-800 font-medium break-words">
        {value}
      </span>
    </div>
  );
}

// ── Section header with icon ─────────────────────────
function SectionHeader({ icon, title }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
      <span className="text-base">{icon}</span>
      <span>{title}</span>
    </h3>
  );
}

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBookingById(id);
      setBooking(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Booking not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCancel = async (reason) => {
    setActionLoading(true);
    setActionError('');
    try {
      const updated = await cancelBooking(id, reason);
      setBooking(updated);
      setShowCancelModal(false);
      setSuccessMsg('Booking cancelled successfully.');
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Cancellation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this booking request? This is permanent.')) return;
    try {
      await deleteBooking(id);
      navigate('/bookings/me');
    } catch (err) {
      setActionError(err?.response?.data?.message || 'Delete failed.');
    }
  };

  const canCancel =
    booking && (booking.status === 'PENDING' || booking.status === 'APPROVED');
  const canDelete =
    booking &&
    booking.status === 'PENDING' &&
    booking.requestedBy === currentUser.username;

  // ── Loading / Error ────────────────────────────────
  if (loading)
    return (
      <div className="flex flex-col gap-6 pb-12">
        <LoadingState message="Loading booking details…" />
      </div>
    );
  if (error)
    return (
      <div className="flex flex-col gap-6 pb-12">
        <ErrorState message={error} onRetry={load} />
      </div>
    );
  if (!booking) return null;

  const banner = STATUS_BANNER[booking.status] || STATUS_BANNER.PENDING;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* ── Breadcrumbs ──────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          to="/bookings"
          className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
        >
          Dashboard
        </Link>
        <span className="text-slate-300">›</span>
        <Link
          to={isAdmin ? '/bookings/admin' : '/bookings/me'}
          className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
        >
          {isAdmin ? 'All Bookings' : 'My Bookings'}
        </Link>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500 font-medium">Details</span>
      </nav>

      {/* ── Status banner ────────────────────────────── */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border ${banner.bg} ${banner.text} text-sm font-medium`}
      >
        <span className="text-lg">{banner.icon}</span>
        <span>{banner.message}</span>
      </div>

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {booking.resourceName}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <BookingStatusBadge status={booking.status} />
            <span className="text-sm text-slate-500">
              Requested by{' '}
              <strong className="text-slate-700">{booking.requestedBy}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">·</span>
            <span className="text-xs font-mono text-slate-400">
              {booking.resourceId}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(canCancel || canDelete) && (
          <div className="flex gap-2 items-center shrink-0">
            {canCancel && (
              <BkBtn
                variant="danger"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Booking
              </BkBtn>
            )}
            {canDelete && (
              <BkBtn variant="ghost" onClick={handleDelete}>
                Delete Request
              </BkBtn>
            )}
          </div>
        )}
      </div>

      {/* ── Success / Error ──────────────────────────── */}
      {successMsg && <BkSuccessBanner icon="✅">{successMsg}</BkSuccessBanner>}
      <BkServerError message={actionError} />

      {/* ── Info Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Resource Information */}
        <BkCard className="p-5 sm:p-6">
          <SectionHeader icon="📋" title="Resource Information" />
          <div className="flex flex-col">
            <InfoRow label="Resource ID" value={booking.resourceId} />
            <InfoRow label="Resource Name" value={booking.resourceName} />
            <InfoRow
              label="Type"
              value={booking.resourceType?.replace(/_/g, ' ')}
            />
            <InfoRow label="Location" value={booking.location} />
          </div>
        </BkCard>

        {/* Schedule */}
        <BkCard className="p-5 sm:p-6">
          <SectionHeader icon="📅" title="Schedule" />
          <div className="flex flex-col">
            <InfoRow label="Booking Date" value={booking.bookingDate} />
            <InfoRow label="Start Time" value={booking.startTime} />
            <InfoRow label="End Time" value={booking.endTime} />
            <InfoRow
              label="Attendees"
              value={booking.expectedAttendees}
            />
          </div>
        </BkCard>

        {/* Purpose — full width */}
        <BkCard className="p-5 sm:p-6 md:col-span-2">
          <SectionHeader icon="📝" title="Purpose" />
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {booking.purpose}
          </p>
        </BkCard>

        {/* Audit Trail */}
        <BkCard className="p-5 sm:p-6 md:col-span-2">
          <SectionHeader icon="🕐" title="Audit Trail" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <div className="flex flex-col">
              <InfoRow
                label="Created At"
                value={
                  booking.createdAt
                    ? new Date(booking.createdAt).toLocaleString()
                    : null
                }
              />
              <InfoRow
                label="Updated At"
                value={
                  booking.updatedAt
                    ? new Date(booking.updatedAt).toLocaleString()
                    : null
                }
              />
            </div>
            <div className="flex flex-col">
              {booking.reviewedBy && (
                <InfoRow label="Reviewed By" value={booking.reviewedBy} />
              )}
              {booking.reviewedAt && (
                <InfoRow
                  label="Reviewed At"
                  value={new Date(booking.reviewedAt).toLocaleString()}
                />
              )}
              {booking.reviewReason && (
                <InfoRow label="Review Note" value={booking.reviewReason} />
              )}
              {booking.cancelledBy && (
                <InfoRow label="Cancelled By" value={booking.cancelledBy} />
              )}
              {booking.cancelledAt && (
                <InfoRow
                  label="Cancelled At"
                  value={new Date(booking.cancelledAt).toLocaleString()}
                />
              )}
              {booking.cancellationReason && (
                <InfoRow
                  label="Cancellation Reason"
                  value={booking.cancellationReason}
                />
              )}
            </div>
          </div>
        </BkCard>
      </div>

      {/* ── Cancel Modal ─────────────────────────────── */}
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