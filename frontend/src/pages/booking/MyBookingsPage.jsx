import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';
import { BkCard, btnCls } from '../../components/booking/BkUI';

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
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Link to="/bookings" className="text-blue-500 hover:underline">Dashboard</Link>
                        <span className="text-slate-300">›</span>
                        <span>My Bookings</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">My Bookings</h1>
                    <p className="text-slate-500 text-sm">All booking requests submitted by you.</p>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                    <Link to="/bookings/new" className={btnCls('primary')}>+ New Booking</Link>
                </div>
            </div>

            <BkCard className="p-5">
                <BookingFilterBar filters={filters} onChange={setFilters} />
            </BkCard>

            {loading && <LoadingState message="Loading your bookings…" />}
            {!loading && error && <ErrorState message={error} onRetry={load} />}
            {!loading && !error && filtered.length === 0 && (
                <EmptyState message="No bookings match your current filters." icon="📭" />
            )}

            {!loading && !error && filtered.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((b) => (
                        <Link
                            key={b.id}
                            to={`/bookings/${b.id}`}
                            className="bg-white border border-slate-200 rounded-xl p-5 no-underline flex flex-col gap-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-bold text-slate-900">{b.resourceName}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">{b.resourceType?.replace(/_/g, ' ')}</span>
                                </div>
                                <BookingStatusBadge status={b.status} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-mono">
                                    <span>📅 {b.bookingDate}</span>
                                    <span>🕐 {b.startTime} – {b.endTime}</span>
                                    <span>📍 {b.location}</span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 m-0">{b.purpose}</p>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">👥 {b.expectedAttendees} attendees</span>
                                <span className="text-blue-500 font-semibold">View Details →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

