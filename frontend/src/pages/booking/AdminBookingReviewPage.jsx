import { useEffect, useState, useCallback } from 'react';
import { fetchAllBookings, approveBooking, rejectBooking } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BookingTable from '../../components/booking/BookingTable';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import { ApprovalModal, RejectionModal } from '../../components/booking/BookingActionModals';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';
import { BkBtn, BkCard, BkServerError } from '../../components/booking/BkUI';

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
                <BkBtn variant="success" size="xs" onClick={(e) => { e.preventDefault(); setApproveTarget(booking.id); }}>
                    Approve
                </BkBtn>
                <BkBtn variant="danger" size="xs" onClick={(e) => { e.preventDefault(); setRejectTarget(booking.id); }}>
                    Reject
                </BkBtn>
            </>
        );
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {toast && (
                <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-5 py-3.5 rounded-xl text-sm font-medium shadow-2xl z-50 animate-[bk-slide-up_0.25s_ease]">
                    ✅ {toast}
                </div>
            )}

            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Admin — Booking Review</h1>
                    <p className="text-slate-500 text-sm">
                        Review and process all campus resource booking requests.
                    </p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <BkBtn variant="outline" onClick={load}>↻ Refresh</BkBtn>
                </div>
            </div>

            {!loading && !error && <BookingSummaryCards bookings={bookings} />}

            <BkCard className="p-5">
                <BookingFilterBar filters={filters} onChange={setFilters} showRequesterFilter />
            </BkCard>

            <BkServerError message={error} />

            {loading && <LoadingState message="Fetching all bookings…" />}
            {!loading && !error && bookings.length === 0 && (
                <EmptyState message="No bookings match the current filters." icon="📋" />
            )}
            {!loading && !error && bookings.length > 0 && (
                <BkCard className="overflow-hidden">
                    <BookingTable bookings={bookings} actions={adminActions} />
                </BkCard>
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
