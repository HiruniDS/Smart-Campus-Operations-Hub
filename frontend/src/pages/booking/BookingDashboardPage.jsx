import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings, fetchAllBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingSummaryCards from '../../components/booking/BookingSummaryCards';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import { LoadingState, ErrorState } from '../../components/booking/BookingStates';
import { btnCls } from '../../components/booking/BkUI';
import dashboardHero from '../../assets/booking/booking-dashboard-hero.png';
import dashboardEmpty from '../../assets/booking/booking-dashboard-empty-state.png';

/* ─── Status colours ─────────────────────────────────────── */
const STATUS_BORDER = {
  APPROVED:  'border-l-emerald-500',
  PENDING:   'border-l-amber-400',
  REJECTED:  'border-l-rose-500',
  CANCELLED: 'border-l-slate-300',
};

/* ─── Resource type definitions ──────────────────────────── */
const RESOURCE_TYPES = [
  {
    key: 'LECTURE_HALL', label: 'Lecture Hall', desc: 'Large lecture venues',
    color: { bg: '#EFF6FF', text: '#2563EB' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M4 20V10l8-7 8 7v10M10 20v-6h4v6" />
      </svg>
    ),
  },
  {
    key: 'LAB', label: 'Lab', desc: 'Research & computing',
    color: { bg: '#F0FDFA', text: '#0D9488' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6M9 3v7l-5 11h16L15 10V3" />
        <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'SEMINAR_ROOM', label: 'Seminar Room', desc: 'Group discussion rooms',
    color: { bg: '#F5F3FF', text: '#7C3AED' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: 'SPORTS_FACILITY', label: 'Sports Facility', desc: 'Courts & outdoor areas',
    color: { bg: '#F0FDF4', text: '#16A34A' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
      </svg>
    ),
  },
  {
    key: 'STUDY_ROOM', label: 'Study Room', desc: 'Quiet focus spaces',
    color: { bg: '#FFFBEB', text: '#D97706' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    key: 'OTHER', label: 'Other', desc: 'Additional spaces',
    color: { bg: '#F8FAFC', text: '#64748B' },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

/* ─── Quick-action colour map ────────────────────────────── */
const QA_COLOR = {
  emerald: { bg: '#F0FDF4', text: '#059669' },
  indigo:  { bg: '#EEF2FF', text: '#6366F1' },
  teal:    { bg: '#F0FDFA', text: '#0D9488' },
  violet:  { bg: '#F5F3FF', text: '#7C3AED' },
};

/* ─── Inline styles injected once ────────────────────────── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .bk-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes bkFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bk-u0 { animation: bkFadeUp .4s ease both; }
  .bk-u1 { animation: bkFadeUp .4s .08s ease both; }
  .bk-u2 { animation: bkFadeUp .4s .16s ease both; }
  .bk-u3 { animation: bkFadeUp .4s .24s ease both; }
  .bk-u4 { animation: bkFadeUp .4s .32s ease both; }
  .bk-res-card:hover .bk-arrow { transform: translateX(4px); }
  .bk-res-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
  .bk-res-card { transition: transform .2s ease, box-shadow .2s ease; }
  .bk-booking-row:hover { background: #FAFAF8; }
`;

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function BookingDashboardPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser.role === 'ADMIN';

  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

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

  const recent   = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const initials = currentUser?.username?.charAt(0).toUpperCase() || '?';
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    /* ── Page shell ── */
    <div className="bk-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{GLOBAL_STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-14">

        {/* ╔══════════════════════════════╗
            ║           HERO              ║
            ╚══════════════════════════════╝ */}
        <div className="bk-u0 relative overflow-hidden rounded-2xl mb-7" style={{ background: '#0C1D11' }}>

          {/* dot-grid texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }} />

          {/* green top-bar accent */}
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)' }} />

          {/* ambient glow */}
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />
          <div className="absolute bottom-0 right-48 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06), transparent 70%)' }} />

          {/* hero illustration */}
          <img
            src={dashboardHero}
            alt="Campus resource booking"
            className="absolute bottom-0 right-0 h-full w-auto pointer-events-none select-none hidden xl:block"
            style={{ maxWidth: '38%', objectFit: 'cover', objectPosition: 'left', opacity: 0.55 }}
          />

          {/* content */}
          <div className="relative px-8 py-10 xl:pr-[40%]">

            {/* status pill */}
            <div className="flex items-center gap-2 mb-5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isAdmin ? 'Admin Console' : 'Student Portal'}
              </span>
            </div>

            {/* avatar + title */}
            <div className="flex items-center gap-4 mb-3">
              {!isAdmin ? (
                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl items-center justify-center text-xl font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 0 3px rgba(16,185,129,0.25)' }}>
                  {initials}
                </div>
              ) : (
                <div className="hidden sm:flex shrink-0 w-12 h-12 rounded-2xl items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', boxShadow: '0 0 0 3px rgba(139,92,246,0.25)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: '#6EE7B7' }}>{greeting}</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none" style={{ color: '#F0FDF4' }}>
                  {isAdmin ? 'Booking Dashboard' : currentUser.username}
                </h1>
              </div>
            </div>

            <p className="text-sm max-w-xs mb-8" style={{ color: '#9CA3AF', lineHeight: 1.65 }}>
              {isAdmin
                ? 'Review and manage all campus resource booking requests.'
                : 'Manage your campus resource reservations from one place.'}
            </p>

            {/* action buttons */}
            <div className="flex flex-wrap gap-3">
              {!isAdmin && (
                <Link to="/bookings/new"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                  <span className="text-base leading-none">+</span> New Booking
                </Link>
              )}
              {isAdmin && (
                <Link to="/bookings/admin"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                  Review Requests →
                </Link>
              )}
              <Link to="/bookings/availability"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                style={{ background: 'rgba(255,255,255,0.07)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}>
                Availability
              </Link>
            </div>
          </div>
        </div>

        {/* ── loading / error ── */}
        {loading && <LoadingState message="Loading dashboard…" />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}

        {/* ╔══════════════════════════════╗
            ║        MAIN CONTENT         ║
            ╚══════════════════════════════╝ */}
        {!loading && !error && (
          <div className="flex flex-col gap-6">

            {/* summary cards */}
            <div className="bk-u1">
              <BookingSummaryCards bookings={bookings} />
            </div>

            {/* two-column grid — use standard 3-col grid so xl fires reliably */}
            <div className="bk-u2 grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* ── Recent Bookings panel — spans 2 of 3 cols on xl ── */}
              <div className="xl:col-span-2 flex flex-col rounded-2xl overflow-hidden bg-white"
                style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                {/* header */}
                <div className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: '1px solid #F0EDE6' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm" style={{ color: '#111827' }}>Recent Bookings</span>
                    {recent.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: '#F0FDF4', color: '#059669' }}>
                        {recent.length}
                      </span>
                    )}
                  </div>
                  <Link to={isAdmin ? '/bookings/admin' : '/bookings/me'}
                    className="text-xs font-bold hover:opacity-70 transition-opacity"
                    style={{ color: '#059669' }}>
                    View all →
                  </Link>
                </div>

                {/* list / empty */}
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-16 px-6 text-center flex-1">
                    <img src={dashboardEmpty} alt="No bookings" width="160" loading="lazy" className="opacity-70" />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#374151' }}>No bookings yet</p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Create a booking request to get started.</p>
                    </div>
                    {!isAdmin && (
                      <Link to="/bookings/new" className={btnCls('primary', 'sm')}>+ Create Booking</Link>
                    )}
                  </div>
                ) : (
                  <div style={{ divideColor: '#F5F3EE' }}>
                    {recent.map((b) => {
                      const bl = STATUS_BORDER[b.status] || 'border-l-slate-200';
                      return (
                        <Link
                          key={b.id}
                          to={`/bookings/${b.id}`}
                          className={`bk-booking-row group flex items-center gap-4 px-6 py-4 border-l-[3px] ${bl} transition-colors duration-100`}
                          style={{ borderBottom: '1px solid #F5F3EE' }}
                        >
                          <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: '#F5F3EE' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-sm truncate" style={{ color: '#111827' }}>
                              {b.resourceName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs tabular-nums" style={{ color: '#9CA3AF' }}>{b.bookingDate}</span>
                              <span className="text-[10px] select-none" style={{ color: '#D1D5DB' }}>·</span>
                              <span className="text-xs font-mono tabular-nums" style={{ color: '#9CA3AF' }}>{b.startTime}–{b.endTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <BookingStatusBadge status={b.status} />
                            <span className="text-xs hidden sm:block" style={{ color: '#D1D5DB' }}>›</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Right column — 1/3 width, full height ── */}
              <div className="xl:col-span-1 flex flex-col gap-5">

                {/* Quick Actions */}
                <div className="rounded-2xl overflow-hidden bg-white"
                  style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid #F0EDE6' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EEF2FF' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                      </svg>
                    </div>
                    <span className="font-bold text-sm" style={{ color: '#111827' }}>Quick Actions</span>
                  </div>
                  <div className="p-3 space-y-1">
                    {!isAdmin ? (
                      <>
                        <QuickActionItem to="/bookings/new" color="emerald" label="Create Booking" sub="Request a campus resource"
                          icon={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />
                        <QuickActionItem to="/bookings/me" color="indigo" label="My Bookings" sub="View your booking history"
                          icon={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>} />
                        <QuickActionItem to="/bookings/availability" color="teal" label="Check Availability" sub="See open time slots"
                          icon={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />
                      </>
                    ) : (
                      <>
                        <QuickActionItem to="/bookings/admin" color="violet" label="Review Requests" sub="Approve or reject bookings"
                          icon={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>} />
                        <QuickActionItem to="/bookings/availability" color="teal" label="Check Availability" sub="See open time slots"
                          icon={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} />
                      </>
                    )}
                  </div>
                </div>

                {/* How it works — flex-1 so it fills remaining right-column height */}
                <div className="flex-1 rounded-2xl p-6" style={{ background: '#0C1D11' }}>
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="w-1 h-4 rounded-full" style={{ background: '#10B981' }} />
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: '#6EE7B7' }}>
                      How it works
                    </span>
                  </div>
                  <div className="space-y-5">
                    {[
                      'Submit a request for a campus resource (room, lab, hall, etc.)',
                      'An admin reviews and approves or rejects your request.',
                      'Your slot is confirmed and visible under My Bookings.',
                    ].map((text, i) => (
                      <div key={i} className="flex gap-4 items-start">
                        <span className="shrink-0 text-xs font-extrabold tabular-nums"
                          style={{ color: '#10B981', paddingTop: '2px' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div className="h-px flex-1 mt-3" style={{ background: 'rgba(16,185,129,0.15)' }} />
                        <p className="text-sm leading-relaxed flex-[5]" style={{ color: '#9CA3AF' }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* ╔══════════════════════════════╗
                ║      RESOURCE GRID          ║
                ╚══════════════════════════════╝ */}
            <div className="bk-u3">
              {/* section header */}
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] mb-0.5"
                    style={{ color: '#9CA3AF' }}>
                    {isAdmin ? 'Resource Categories' : 'Book a Space'}
                  </p>
                  <p className="text-base font-bold" style={{ color: '#1C1917' }}>
                    What would you like to reserve?
                  </p>
                </div>
                <Link to={isAdmin ? '/bookings/admin' : '/bookings/new'}
                  className="text-xs font-bold hover:opacity-70 transition-opacity hidden sm:block"
                  style={{ color: '#059669' }}>
                  {isAdmin ? 'View all requests →' : 'Open booking form →'}
                </Link>
              </div>

              {/* resource cards grid — standard classes only so Tailwind always generates them */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {RESOURCE_TYPES.map((rt) => (
                  <Link key={rt.key} to="/bookings/new"
                    className="bk-res-card group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white text-center"
                    style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: rt.color.bg, color: rt.color.text }}>
                      <div className="w-5 h-5">{rt.icon}</div>
                    </div>
                    <div>
                      <p className="text-[13px] font-bold leading-tight" style={{ color: '#111827' }}>{rt.label}</p>
                      <p className="text-[11px] mt-0.5 leading-snug hidden sm:block" style={{ color: '#9CA3AF' }}>{rt.desc}</p>
                    </div>
                    <span className="bk-arrow text-xs transition-transform duration-200"
                      style={{ color: '#D1D5DB' }}>→</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

/* ─── QuickActionItem sub-component ─────────────────────── */
function QuickActionItem({ to, icon, label, sub, color = 'emerald' }) {
  const c = QA_COLOR[color] || QA_COLOR.emerald;
  return (
    <Link to={to}
      className="group flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-100 hover:bg-stone-50">
      <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: c.bg, color: c.text }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </span>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold" style={{ color: '#111827' }}>{label}</span>
        <span className="text-xs" style={{ color: '#9CA3AF' }}>{sub}</span>
      </div>
      <span className="text-sm transition-transform group-hover:translate-x-0.5"
        style={{ color: '#D1D5DB' }}>›</span>
    </Link>
  );
}