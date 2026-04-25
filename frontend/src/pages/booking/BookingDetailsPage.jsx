import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBookingById, cancelBooking, deleteBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { CancellationModal } from '../../components/booking/BookingActionModals';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';

function InfoRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <div className="bk-info-row">
            <span className="bk-info-label">{label}</span>
            <span className="bk-info-value">{value}</span>
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

    if (loading) return <div className="bk-page"><LoadingState message="Loading booking details…" /></div>;
    if (error) return <div className="bk-page"><ErrorState message={error} onRetry={load} /></div>;
    if (!booking) return null;

    return (
        <div className="bk-page">
            <div className="bk-page-header">
                <div>
                    <div className="bk-breadcrumb">
                        <Link to="/bookings" className="bk-breadcrumb-link">Dashboard</Link>
                        <span className="bk-breadcrumb-sep">›</span>
                        <Link to={isAdmin ? '/bookings/admin' : '/bookings/me'} className="bk-breadcrumb-link">
                            {isAdmin ? 'All Bookings' : 'My Bookings'}
                        </Link>
                        <span className="bk-breadcrumb-sep">›</span>
                        <span>Details</span>
                    </div>
                    <h1 className="bk-page-title">{booking.resourceName}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                        <BookingStatusBadge status={booking.status} />
                        <span className="bk-page-subtitle" style={{ margin: 0 }}>
                            Requested by <strong>{booking.requestedBy}</strong>
                        </span>
                    </div>
                </div>
                <div className="bk-page-actions">
                    {canCancel && (
                        <button className="bk-btn bk-btn-danger" onClick={() => setShowCancelModal(true)}>
                            Cancel Booking
                        </button>
                    )}
                    {canDelete && (
                        <button className="bk-btn bk-btn-ghost" onClick={handleDelete}>
                            Delete Request
                        </button>
                    )}
                </div>
            </div>

            {successMsg && <div className="bk-success-banner"><span>✅</span><strong>{successMsg}</strong></div>}
            {actionError && <div className="bk-server-error"><strong>⚠ {actionError}</strong></div>}

            <div className="bk-details-grid">
                <div className="bk-card">
                    <h3 className="bk-card-title">Resource Information</h3>
                    <div className="bk-info-list">
                        <InfoRow label="Resource ID" value={booking.resourceId} />
                        <InfoRow label="Resource Name" value={booking.resourceName} />
                        <InfoRow label="Type" value={booking.resourceType?.replace(/_/g, ' ')} />
                        <InfoRow label="Location" value={booking.location} />
                    </div>
                </div>

                <div className="bk-card">
                    <h3 className="bk-card-title">Schedule</h3>
                    <div className="bk-info-list">
                        <InfoRow label="Booking Date" value={booking.bookingDate} />
                        <InfoRow label="Start Time" value={booking.startTime} />
                        <InfoRow label="End Time" value={booking.endTime} />
                        <InfoRow label="Expected Attendees" value={booking.expectedAttendees} />
                    </div>
                </div>

                <div className="bk-card bk-card-full">
                    <h3 className="bk-card-title">Purpose</h3>
                    <p className="bk-purpose-text">{booking.purpose}</p>
                </div>

                <div className="bk-card">
                    <h3 className="bk-card-title">Audit Trail</h3>
                    <div className="bk-info-list">
                        <InfoRow label="Created At" value={booking.createdAt ? new Date(booking.createdAt).toLocaleString() : null} />
                        <InfoRow label="Updated At" value={booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : null} />
                        {booking.reviewedBy && <InfoRow label="Reviewed By" value={booking.reviewedBy} />}
                        {booking.reviewedAt && <InfoRow label="Reviewed At" value={new Date(booking.reviewedAt).toLocaleString()} />}
                        {booking.reviewReason && <InfoRow label="Review Note" value={booking.reviewReason} />}
                        {booking.cancelledBy && <InfoRow label="Cancelled By" value={booking.cancelledBy} />}
                        {booking.cancelledAt && <InfoRow label="Cancelled At" value={new Date(booking.cancelledAt).toLocaleString()} />}
                        {booking.cancellationReason && <InfoRow label="Cancellation Reason" value={booking.cancellationReason} />}
                    </div>
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
