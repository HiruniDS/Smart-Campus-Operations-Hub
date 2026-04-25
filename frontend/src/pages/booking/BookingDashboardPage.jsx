import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, fetchAllBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';
import { BkCard, btnCls } from '../../components/booking/BkUI';
import dashboardHero from '../../assets/booking/booking-dashboard-hero.png';
import dashboardEmpty from '../../assets/booking/booking-dashboard-empty-state.png';

// Status accent colors (left border of recent items)
const statusBorder = {
  APPROVED: 'border-l-emerald-500',
  PENDING: 'border-l-amber-500',
  REJECTED: 'border-l-rose-500',
  CANCELLED: 'border-l-slate-400',
};

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

  useEffect(() => {
    load();
  }, [currentUser]);

  const recent = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // User initials for welcome avatar (non-admin)
  const initials = currentUser?.username?.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex flex-col gap-8 pb-16">
      {/* ========== HEADER SECTION ========== */}
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-white p-6 sm:p-8 shadow-sm border border-slate-100">
        {/* Subtle decorative element */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
        {/* Hero illustration */}
        <img
          src={dashboardHero}
          alt="Campus resource booking dashboard overview"
          width="480"
          height="210"
          loading="eager"
          className="absolute bottom-0 right-0 h-full w-auto max-w-[42%] object-cover object-left opacity-90 pointer-events-none select-none hidden lg:block"
        />

        <div className="relative flex items-center gap-4">
          {!isAdmin && (
            <div className="hidden sm:flex shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white items-center justify-center text-2xl font-bold shadow-md shadow-blue-500/20">
              {initials}
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {isAdmin ? 'Booking Dashboard' : `Welcome back, ${currentUser.username}`}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              {isAdmin
                ? 'Manage all campus resource bookings across the system.'
                : 'Here’s a quick overview of your recent bookings and activity.'}
            </p>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-3">
          {!isAdmin && (
            <Link
              to="/bookings/new"
              className={`${btnCls('primary')} inline-flex items-center gap-2 transform transition-all hover:scale-105 hover:shadow-lg`}
            >
              <span>+</span> New Booking
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/bookings/admin"
              className={`${btnCls('primary')} inline-flex items-center gap-2 transform transition-all hover:scale-105 hover:shadow-lg`}
            >
              Review All Bookings
            </Link>
          )}
        </div>
      </div>

      {/* ========== LOADING / ERROR STATES ========== */}
      {loading && <LoadingState message="Loading dashboard…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {/* ========== MAIN DASHBOARD CONTENT ========== */}
      {!loading && !error && (
        <>
          {/* Summary Cards (existing component, aligned with new rhythm) */}
          <BookingSummaryCards bookings={bookings} />

          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            {/* ---------- RECENT BOOKINGS ---------- */}
            <BkCard className="p-6 sm:p-7 backdrop-blur-sm bg-white/90 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-slate-800">Recent Bookings</h3>
                <Link
                  to={isAdmin ? '/bookings/admin' : '/bookings/me'}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all →
                </Link>
              </div>

              {recent.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8 text-slate-400">
                  <img
                    src={dashboardEmpty}
                    alt="No bookings yet"
                    width="220"
                    height="146"
                    loading="lazy"
                    className="opacity-80"
                  />
                  <p className="text-sm">No bookings yet. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recent.map((b) => {
                    const borderColor = statusBorder[b.status] || 'border-l-slate-300';
                    return (
                      <Link
                        key={b.id}
                        to={`/bookings/${b.id}`}
                        className={`group flex items-center justify-between pl-4 pr-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-200 border-l-4 ${borderColor} hover:shadow-sm`}
                      >
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-semibold text-slate-800 text-sm truncate">
                            {b.resourceName}
                          </span>
                          <span className="text-xs text-slate-500 font-mono tracking-tight">
                            {b.bookingDate} · {b.startTime}–{b.endTime}
                          </span>
                        </div>
                        <BookingStatusBadge status={b.status} />
                      </Link>
                    );
                  })}
                </div>
              )}
            </BkCard>

            {/* ---------- QUICK ACTIONS ---------- */}
            <BkCard className="p-6 sm:p-7 backdrop-blur-sm bg-white/90 border border-slate-200/80 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-5">Quick Actions</h3>
              <div className="space-y-3">
                {!isAdmin && (
                  <>
                    <QuickActionLink
                      to="/bookings/new"
                      icon="📅"
                      label="Create Booking"
                    />
                    <QuickActionLink
                      to="/bookings/me"
                      icon="📋"
                      label="My Bookings"
                    />
                    <QuickActionLink
                      to="/bookings/availability"
                      icon="🔍"
                      label="Check Availability"
                    />
                  </>
                )}
                {isAdmin && (
                  <>
                    <QuickActionLink
                      to="/bookings/admin"
                      icon="🛠"
                      label="Review Requests"
                    />
                    <QuickActionLink
                      to="/bookings/availability"
                      icon="🔍"
                      label="Check Availability"
                    />
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

/** Small internal component for a polished quick-action link */
function QuickActionLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-medium text-sm transition-all duration-200 hover:bg-white hover:border-blue-200 hover:text-blue-700 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-xl shadow-sm group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}