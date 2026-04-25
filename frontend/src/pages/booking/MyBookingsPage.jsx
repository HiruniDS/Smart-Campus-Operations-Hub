import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';

export default function MyBookingsPage() {
    const { currentUser } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', bookingDate: '', resourceId: '' });

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchMyBookings();
            setBookings(data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load your bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [currentUser]);

    const filtered = bookings.filter((b) => {
        if (filters.status && b.status !== filters.status) return false;
        if (filters.bookingDate && b.bookingDate !== filters.bookingDate) return false;
        if (filters.resourceId && !b.resourceId.toLowerCase().includes(filters.resourceId.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="bk-page">
            <div className="bk-page-header">
                <div>
                    <div className="bk-breadcrumb">
                        <Link to="/bookings" className="bk-breadcrumb-link">Dashboard</Link>
                        <span className="bk-breadcrumb-sep">›</span>
                        <span>My Bookings</span>
                    </div>
                    <h1 className="bk-page-title">My Bookings</h1>
                    <p className="bk-page-subtitle">All booking requests submitted by you.</p>
                </div>
                <div className="bk-page-actions">
                    <Link to="/bookings/new" className="bk-btn bk-btn-primary">+ New Booking</Link>
                </div>
            </div>

            <div className="bk-card">
                <BookingFilterBar filters={filters} onChange={setFilters} />
            </div>

            {loading && <LoadingState message="Loading your bookings…" />}
            {!loading && error && <ErrorState message={error} onRetry={load} />}
            {!loading && !error && filtered.length === 0 && (
                <EmptyState message="No bookings match your current filters." icon="📭" />
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="bk-booking-grid">
                    {filtered.map((b) => (
                        <Link key={b.id} to={`/bookings/${b.id}`} className="bk-booking-card">
                            <div className="bk-booking-card-top">
                                <div className="bk-booking-card-resource">
                                    <span className="bk-booking-card-name">{b.resourceName}</span>
                                    <span className="bk-booking-card-type">{b.resourceType?.replace(/_/g, ' ')}</span>
                                </div>
                                <BookingStatusBadge status={b.status} />
                            </div>
                            <div className="bk-booking-card-body">
                                <div className="bk-booking-card-meta">
                                    <span>📅 {b.bookingDate}</span>
                                    <span>🕐 {b.startTime} – {b.endTime}</span>
                                    <span>📍 {b.location}</span>
                                </div>
                                <p className="bk-booking-card-purpose">{b.purpose}</p>
                            </div>
                            <div className="bk-booking-card-footer">
                                <span className="bk-booking-card-attendees">👥 {b.expectedAttendees} attendees</span>
                                <span className="bk-booking-card-link">View Details →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
