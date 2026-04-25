import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, fetchAllBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';
import { BkCard, btnCls } from '../../components/booking/BkUI';

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
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Booking Dashboard</h1>
                    <p className="text-slate-500 text-sm">
                        {isAdmin
                            ? 'Manage all campus resource bookings across the system.'
                            : `Welcome back, ${currentUser.username}. Here’s an overview of your bookings.`}
                    </p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    {!isAdmin && (
                        <Link to="/bookings/new" className={btnCls('primary')}>
                            + New Booking
                        </Link>
                    )}
                    {isAdmin && (
                        <Link to="/bookings/admin" className={btnCls('primary')}>
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

                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
                        {/* Recent Bookings */}
                        <BkCard className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold text-slate-800 m-0">Recent Bookings</h3>
                                <Link
                                    to={isAdmin ? '/bookings/admin' : '/bookings/me'}
                                    className="text-blue-500 text-sm hover:underline"
                                >
                                    View all →
                                </Link>
                            </div>
                            {recent.length === 0 ? (
                                <p className="text-slate-400 text-sm text-center py-6">No bookings yet.</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {recent.map((b) => (
                                        <Link
                                            key={b.id}
                                            to={`/bookings/${b.id}`}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 no-underline transition-colors"
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-slate-800 text-sm">{b.resourceName}</span>
                                                <span className="text-xs text-slate-400 font-mono">{b.bookingDate} · {b.startTime}–{b.endTime}</span>
                                            </div>
                                            <BookingStatusBadge status={b.status} />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </BkCard>

                        {/* Quick Actions */}
                        <BkCard className="p-6">
                            <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h3>
                            <div className="flex flex-col gap-2.5">
                                {!isAdmin && (
                                    <>
                                        <Link to="/bookings/new" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all no-underline">
                                            <span className="text-lg w-6 text-center">📅</span>
                                            <span>Create Booking</span>
                                        </Link>
                                        <Link to="/bookings/me" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all no-underline">
                                            <span className="text-lg w-6 text-center">📋</span>
                                            <span>My Bookings</span>
                                        </Link>
                                        <Link to="/bookings/availability" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all no-underline">
                                            <span className="text-lg w-6 text-center">🔍</span>
                                            <span>Check Availability</span>
                                        </Link>
                                    </>
                                )}
                                {isAdmin && (
                                    <>
                                        <Link to="/bookings/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all no-underline">
                                            <span className="text-lg w-6 text-center">🛠</span>
                                            <span>Review Requests</span>
                                        </Link>
                                        <Link to="/bookings/availability" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all no-underline">
                                            <span className="text-lg w-6 text-center">🔍</span>
                                            <span>Check Availability</span>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </BkCard>
                    </div>
                </>
            )}
        </div>
    );
}

