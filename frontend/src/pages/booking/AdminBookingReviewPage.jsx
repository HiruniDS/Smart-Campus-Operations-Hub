import { useEffect, useState, useCallback } from 'react';
import { fetchAllBookings, approveBooking, rejectBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BookingTable from '../../components/booking/BookingTable';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import { ApprovalModal, RejectionModal } from '../../components/booking/BookingActionModals';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';

export default function AdminBookingReviewPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Redirect non-admins
    if (currentUser.role !== 'ADMIN') {
        navigate('/bookings');
        return null;
    }

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', bookingDate: '', requestedBy: '', resourceId: '' });
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

    const adminActions = (booking) => {
        if (booking.status !== 'PENDING') return null;
        return (
            <>
                <button
                    className="bk-btn bk-btn-success bk-btn-xs"
                    onClick={(e) => { e.preventDefault(); setApproveTarget(booking.id); }}
                >
                    Approve
                </button>
                <button
                    className="bk-btn bk-btn-danger bk-btn-xs"
                    onClick={(e) => { e.preventDefault(); setRejectTarget(booking.id); }}
                >
                    Reject
                </button>
            </>
        );
    };

    return (
        <div className="bk-page">
            {toast && (
                <div className="bk-toast">
                    ✅ {toast}
                </div>
            )}

            <div className="bk-page-header">
                <div>
                    <h1 className="bk-page-title">Admin — Booking Review</h1>
                    <p className="bk-page-subtitle">
                        Review and process all campus resource booking requests.
                    </p>
                </div>
                <div className="bk-page-actions">
                    <button className="bk-btn bk-btn-outline" onClick={load}>↻ Refresh</button>
                </div>
            </div>

            {!loading && !error && <BookingSummaryCards bookings={bookings} />}

            <div className="bk-card">
                <BookingFilterBar filters={filters} onChange={setFilters} showRequesterFilter />
            </div>

            {error && <div className="bk-server-error"><strong>⚠ {error}</strong></div>}

            {loading && <LoadingState message="Fetching all bookings…" />}
            {!loading && !error && bookings.length === 0 && (
                <EmptyState message="No bookings match the current filters." icon="📋" />
            )}
            {!loading && !error && bookings.length > 0 && (
                <div className="bk-card bk-card-table">
                    <BookingTable bookings={bookings} actions={adminActions} />
                </div>
            )}

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
