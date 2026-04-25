import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBookingById, cancelBooking, deleteBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { CancellationModal } from '../../components/booking/BookingActionModals';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';
import { BkBtn, BkCard, BkServerError, BkSuccessBanner } from '../../components/booking/BkUI';

function InfoRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 min-w-[130px] shrink-0">{label}</span>
            <span className="text-sm text-slate-800 font-medium">{value}</span>
        </div>
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

    useEffect(() => { load(); }, [id]);

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

    const canCancel = booking && (booking.status === 'PENDING' || booking.status === 'APPROVED');
    const canDelete = booking && booking.status === 'PENDING' && booking.requestedBy === currentUser.username;

    if (loading) return <div className="flex flex-col gap-6 pb-12"><LoadingState message="Loading booking details…" /></div>;
    if (error) return <div className="flex flex-col gap-6 pb-12"><ErrorState message={error} onRetry={load} /></div>;
    if (!booking) return null;

    return (
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Link to="/bookings" className="text-blue-500 hover:underline">Dashboard</Link>
                        <span className="text-slate-300">›</span>
                        <Link to={isAdmin ? '/bookings/admin' : '/bookings/me'} className="text-blue-500 hover:underline">
                            {isAdmin ? 'All Bookings' : 'My Bookings'}
                        </Link>
                        <span className="text-slate-300">›</span>
                        <span>Details</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{booking.resourceName}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <BookingStatusBadge status={booking.status} />
                        <span className="text-slate-500 text-sm">
                            Requested by <strong>{booking.requestedBy}</strong>
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    {canCancel && (
                        <BkBtn variant="danger" onClick={() => setShowCancelModal(true)}>Cancel Booking</BkBtn>
                    )}
                    {canDelete && (
                        <BkBtn variant="ghost" onClick={handleDelete}>Delete Request</BkBtn>
                    )}
                </div>
            </div>

            {successMsg && <BkSuccessBanner icon="✅">{successMsg}</BkSuccessBanner>}
            <BkServerError message={actionError} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <BkCard className="p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Resource Information</h3>
                    <div className="flex flex-col gap-3">
                        <InfoRow label="Resource ID" value={booking.resourceId} />
                        <InfoRow label="Resource Name" value={booking.resourceName} />
                        <InfoRow label="Type" value={booking.resourceType?.replace(/_/g, ' ')} />
                        <InfoRow label="Location" value={booking.location} />
                    </div>
                </BkCard>

                <BkCard className="p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Schedule</h3>
                    <div className="flex flex-col gap-3">
                        <InfoRow label="Booking Date" value={booking.bookingDate} />
                        <InfoRow label="Start Time" value={booking.startTime} />
                        <InfoRow label="End Time" value={booking.endTime} />
                        <InfoRow label="Expected Attendees" value={booking.expectedAttendees} />
                    </div>
                </BkCard>

                <BkCard className="p-6 col-span-full">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Purpose</h3>
                    <p className="text-[0.95rem] text-slate-600 leading-relaxed m-0">{booking.purpose}</p>
                </BkCard>

                <BkCard className="p-6">
                    <h3 className="text-base font-semibold text-slate-800 mb-4">Audit Trail</h3>
                    <div className="flex flex-col gap-3">
                        <InfoRow label="Created At" value={booking.createdAt ? new Date(booking.createdAt).toLocaleString() : null} />
                        <InfoRow label="Updated At" value={booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : null} />
                        {booking.reviewedBy && <InfoRow label="Reviewed By" value={booking.reviewedBy} />}
                        {booking.reviewedAt && <InfoRow label="Reviewed At" value={new Date(booking.reviewedAt).toLocaleString()} />}
                        {booking.reviewReason && <InfoRow label="Review Note" value={booking.reviewReason} />}
                        {booking.cancelledBy && <InfoRow label="Cancelled By" value={booking.cancelledBy} />}
                        {booking.cancelledAt && <InfoRow label="Cancelled At" value={new Date(booking.cancelledAt).toLocaleString()} />}
                        {booking.cancellationReason && <InfoRow label="Cancellation Reason" value={booking.cancellationReason} />}
                    </div>
                </BkCard>
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
