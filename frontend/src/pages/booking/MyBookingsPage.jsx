import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyBookings } from '../../api/bookingApi';
import { useAuth } from '../../context/AuthContext';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import BookingFilterBar from '../../components/booking/BookingFilterBar';
import { LoadingState, EmptyState, ErrorState } from '../../components/booking/BookingStates';

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .mybk-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes mybkFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mybk-u0 { animation: mybkFadeUp .35s ease both; }
  .mybk-u1 { animation: mybkFadeUp .35s .07s ease both; }
  .mybk-u2 { animation: mybkFadeUp .35s .14s ease both; }
  .mybk-u3 { animation: mybkFadeUp .35s .21s ease both; }

  .mybk-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 18px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    text-decoration: none;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
    position: relative;
    overflow: hidden;
  }
  .mybk-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.09);
    border-color: rgba(16,185,129,0.25);
  }
  .mybk-card-bar {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #10B981, #34D399);
    opacity: 0;
    transition: opacity .2s ease;
  }
  .mybk-card:hover .mybk-card-bar { opacity: 1; }

  .mybk-meta-item {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #6B7280;
    font-weight: 500;
  }
  .mybk-meta-icon {
    width: 14px; height: 14px; flex-shrink: 0;
  }
  .mybk-view-link {
    font-size: 12px;
    font-weight: 700;
    color: #059669;
    transition: gap .15s;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .mybk-card:hover .mybk-view-link { gap: 6px; }
`;

/* ─── Icon helpers ────────────────────────────────────────── */
function CalIcon() {
  return (
    <svg className="mybk-meta-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="mybk-meta-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function PinIcon() {
  return (
    <svg className="mybk-meta-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg className="mybk-meta-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function MyBookingsPage() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filters,  setFilters]  = useState({ status: '', bookingDate: '', resourceId: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setBookings(await fetchMyBookings());
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentUser]);

  const filtered = bookings.filter((b) => {
    if (filters.status      && b.status    !== filters.status) return false;
    if (filters.bookingDate && b.bookingDate !== filters.bookingDate) return false;
    if (filters.resourceId  && !b.resourceId.toLowerCase().includes(filters.resourceId.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="mybk-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="mybk-u0 flex items-center gap-1.5 text-xs mb-6">
          <Link to="/bookings" className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#059669' }}>
            Dashboard
          </Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">My Bookings</span>
        </nav>

        {/* ── Page header ────────────────────────────── */}
        <div className="mybk-u1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            {/* accent pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
              style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Student Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: '#0C1D11' }}>
              My Bookings
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#6B7280' }}>
              All booking requests submitted by you.
            </p>
          </div>

          {/* New Booking CTA */}
          <Link to="/bookings/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shrink-0 transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.32)' }}>
            <span className="text-base leading-none">+</span> New Booking
          </Link>
        </div>

        {/* ── Stats strip ────────────────────────────── */}
        {!loading && !error && bookings.length > 0 && (
          <div className="mybk-u2 grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Total',     count: bookings.length,                                          color: '#3B82F6', bg: '#EFF6FF' },
              { label: 'Pending',   count: bookings.filter(b => b.status === 'PENDING').length,   color: '#D97706', bg: '#FFFBEB' },
              { label: 'Approved',  count: bookings.filter(b => b.status === 'APPROVED').length,  color: '#059669', bg: '#F0FDF4' },
              { label: 'Rejected',  count: bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED').length, color: '#E11D48', bg: '#FFF1F2' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className="rounded-2xl p-4 bg-white flex items-center gap-3"
                style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg }}>
                  <span className="text-base font-extrabold tabular-nums" style={{ color }}>{count}</span>
                </div>
                <span className="text-xs font-semibold" style={{ color: '#6B7280' }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Filter bar ─────────────────────────────── */}
        <div className="mybk-u2 mb-5">
          <BookingFilterBar filters={filters} onChange={setFilters} />
        </div>

        {/* ── States ─────────────────────────────────── */}
        {loading && <LoadingState message="Loading your bookings…" />}
        {!loading && error && <ErrorState message={error} onRetry={load} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState message="No bookings match your current filters." />
        )}

        {/* ── Booking cards grid ──────────────────────── */}
        {!loading && !error && filtered.length > 0 && (
          <div className="mybk-u3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <Link key={b.id} to={`/bookings/${b.id}`} className="mybk-card">

                {/* top hover bar */}
                <div className="mybk-card-bar" />

                {/* ── Card header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: 15, color: '#111827',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      marginBottom: 2,
                    }}>
                      {b.resourceName}
                    </p>
                    <p style={{
                      fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      {b.resourceType?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>

                {/* ── Meta row ── */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                  <span className="mybk-meta-item"><CalIcon /> {b.bookingDate}</span>
                  <span className="mybk-meta-item"><ClockIcon /> {b.startTime} – {b.endTime}</span>
                  <span className="mybk-meta-item"><PinIcon /> {b.location}</span>
                </div>

                {/* ── Purpose ── */}
                <p style={{
                  fontSize: 13, color: '#6B7280', lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  margin: 0,
                }}>
                  {b.purpose}
                </p>

                {/* ── Card footer ── */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginTop: 'auto',
                  paddingTop: 12, borderTop: '1px solid #F5F3EE',
                }}>
                  <span className="mybk-meta-item">
                    <UsersIcon /> {b.expectedAttendees} attendees
                  </span>
                  <span className="mybk-view-link">
                    View Details
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </span>
                </div>

              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}