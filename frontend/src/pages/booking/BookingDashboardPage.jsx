import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, fetchAllBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';

export default function BookingDashboardPage() {
    const { currentUser } = useAuth();
    const isAdmin = currentUser.role === 'ADMIN';

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        setError('');
        try {
            const data = isAdmin ? await fetchAllBookings() : await fetchMyBookings();
            setBookings(data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [currentUser]);

    const recent = [...bookings]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    return (
        <div className="bk-page">
            <div className="bk-page-header">
                <div>
                    <h1 className="bk-page-title">Booking Dashboard</h1>
                    <p className="bk-page-subtitle">
                        {isAdmin
                            ? 'Manage all campus resource bookings across the system.'
                            : `Welcome back, ${currentUser.username}. Here's an overview of your bookings.`}
                    </p>
                </div>
                <div className="bk-page-actions">
                    {!isAdmin && (
                        <Link to="/bookings/new" className="bk-btn bk-btn-primary">
                            + New Booking
                        </Link>
                    )}
                    {isAdmin && (
                        <Link to="/bookings/admin" className="bk-btn bk-btn-primary">
                            Review All Bookings
                        </Link>
                    )}
                </div>
            </div>

            {loading && <LoadingState message="Loading dashboard…" />}
            {!loading && error && <ErrorState message={error} onRetry={load} />}

            {!loading && !error && (
                <>
                    <BookingSummaryCards bookings={bookings} />

                    <div className="bk-dashboard-grid">
                        <div className="bk-card">
                            <div className="bk-card-header">
                                <h3 className="bk-card-title">Recent Bookings</h3>
                                <Link
                                    to={isAdmin ? '/bookings/admin' : '/bookings/me'}
                                    className="bk-link"
                                >
                                    View all →
                                </Link>
                            </div>
                            {recent.length === 0 ? (
                                <p className="bk-empty-inline">No bookings yet.</p>
                            ) : (
                                <div className="bk-recent-list">
                                    {recent.map((b) => (
                                        <Link key={b.id} to={`/bookings/${b.id}`} className="bk-recent-item">
                                            <div className="bk-recent-main">
                                                <span className="bk-recent-resource">{b.resourceName}</span>
                                                <span className="bk-recent-meta">{b.bookingDate} · {b.startTime}–{b.endTime}</span>
                                            </div>
                                            <BookingStatusBadge status={b.status} />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bk-card">
                            <div className="bk-card-header">
                                <h3 className="bk-card-title">Quick Actions</h3>
                            </div>
                            <div className="bk-quick-actions">
                                {!isAdmin && (
                                    <>
                                        <Link to="/bookings/new" className="bk-quick-action-btn">
                                            <span className="bk-qa-icon">📅</span>
                                            <span>Create Booking</span>
                                        </Link>
                                        <Link to="/bookings/me" className="bk-quick-action-btn">
                                            <span className="bk-qa-icon">📋</span>
                                            <span>My Bookings</span>
                                        </Link>
                                        <Link to="/bookings/availability" className="bk-quick-action-btn">
                                            <span className="bk-qa-icon">🔍</span>
                                            <span>Check Availability</span>
                                        </Link>
                                    </>
                                )}
                                {isAdmin && (
                                    <>
                                        <Link to="/bookings/admin" className="bk-quick-action-btn">
                                            <span className="bk-qa-icon">🛠</span>
                                            <span>Review Requests</span>
                                        </Link>
                                        <Link to="/bookings/availability" className="bk-quick-action-btn">
                                            <span className="bk-qa-icon">🔍</span>
                                            <span>Check Availability</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
