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

  useEffect(() => {
    load();
  }, [currentUser]);

  const filtered = bookings.filter((b) => {
    if (filters.status && b.status !== filters.status) return false;
    if (filters.bookingDate && b.bookingDate !== filters.bookingDate) return false;
    if (filters.resourceId && !b.resourceId.toLowerCase().includes(filters.resourceId.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* ── Breadcrumbs ──────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link to="/bookings" className="text-blue-500 hover:text-blue-700 transition-colors font-medium">
          Dashboard
        </Link>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500 font-medium">My Bookings</span>
      </nav>

      {/* ── Header ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            All booking requests submitted by you.
          </p>
        </div>
        <Link to="/bookings/new" className={btnCls('primary')}>
          + New Booking
        </Link>
      </div>

      {/* ── Filter bar ───────────────────────────────── */}
      <BookingFilterBar filters={filters} onChange={setFilters} />

      {/* ── Loading / Error / Empty ──────────────────── */}
      {loading && <LoadingState message="Loading your bookings…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState message="No bookings match your current filters." icon="📭" />
      )}

      {/* ── Booking Cards Grid ───────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 no-underline flex flex-col gap-4 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Subtle gradient accent at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              {/* Header: resource name + badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                    {b.resourceName}
                  </span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
                    {b.resourceType?.replace(/_/g, ' ')}
                  </span>
                </div>
                <BookingStatusBadge status={b.status} />
              </div>

              {/* Details */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-slate-400 text-xs">📅</span> {b.bookingDate}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-slate-400 text-xs">🕐</span> {b.startTime} – {b.endTime}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-slate-400 text-xs">📍</span> {b.location}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {b.purpose}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs mt-auto">
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <span className="text-slate-400 text-xs">👥</span> {b.expectedAttendees} attendees
                </span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}