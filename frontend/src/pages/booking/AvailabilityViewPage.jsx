import { useState } from 'react';
import { Link } from 'react-router-dom';
import AvailabilityPanel from '../../components/booking/AvailabilityPanel';
import { BkLabel } from '../../components/booking/BkUI';

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .av-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }

  @keyframes avFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .av-u0 { animation: avFadeUp .35s ease both; }
  .av-u1 { animation: avFadeUp .35s .07s ease both; }
  .av-u2 { animation: avFadeUp .35s .14s ease both; }
  .av-u3 { animation: avFadeUp .35s .21s ease both; }

  .av-input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #E5E7EB;
    background: #FAFAF8;
    font-size: 14px;
    color: #111827;
    outline: none;
    font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
  }
  .av-input::placeholder { color: #C0BBB0; }
  .av-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    background: #fff;
  }

  .av-submit {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 26px; border-radius: 12px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 700; color: #fff; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 4px 14px rgba(16,185,129,0.32);
    transition: filter .15s, transform .15s;
    align-self: flex-start;
  }
  .av-submit:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .av-submit:active { transform: scale(0.98); }

  .av-cta {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 14px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 700; color: #fff; font-family: inherit; text-decoration: none;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 4px 16px rgba(16,185,129,0.32);
    transition: filter .15s, transform .15s;
  }
  .av-cta:hover { filter: brightness(1.08); transform: translateY(-2px); }

  /* tip card items */
  .av-tip {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 0; border-bottom: 1px solid #F0EDE6;
  }
  .av-tip:last-child { border-bottom: none; padding-bottom: 0; }
`;

export default function AvailabilityViewPage() {
  const [resourceId,  setResourceId]  = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [query,       setQuery]       = useState({ resourceId: '', bookingDate: '' });
  const hasResult = query.resourceId || query.bookingDate;

  const handleCheck = (e) => {
    e.preventDefault();
    setQuery({ resourceId, bookingDate });
  };

  return (
    <div className="av-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="av-u0 flex items-center gap-1.5 text-xs mb-6">
          <Link to="/bookings" className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#059669' }}>
            Dashboard
          </Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">Availability</span>
        </nav>

        {/* ── Page header ────────────────────────────── */}
        <div className="av-u1 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Resource Checker
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: '#0C1D11' }}>
            Check Availability
          </h1>
          <p className="text-sm max-w-lg" style={{ color: '#6B7280', lineHeight: 1.7 }}>
            View occupied time slots for any campus resource on a specific date
            before making a booking.
          </p>
        </div>

        {/* ── Two-column layout ──────────────────────── */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">

          {/* ── Left: query card + result ── */}
          <div className="flex flex-col gap-5 w-full xl:max-w-lg">

            {/* Query card */}
            <div className="av-u2 rounded-2xl bg-white overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '18px 24px', borderBottom: '1px solid #F0EDE6',
              }}>
                <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
                <div style={{
                  width: 30, height: 30, borderRadius: 9, background: '#F0FDF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: 0 }}>
                  Resource Availability Query
                </h3>
              </div>

              {/* Form */}
              <form onSubmit={handleCheck} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <BkLabel required>Resource ID</BkLabel>
                  <input className="av-input" value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                    placeholder="e.g. HALL-A1" required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <BkLabel required>Date</BkLabel>
                  <input type="date" className="av-input" value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)} required />
                </div>
                <button type="submit" className="av-submit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Check Availability
                </button>
              </form>
            </div>

            {/* Result panel */}
            {hasResult && (
              <div className="av-u3">
                <AvailabilityPanel resourceId={query.resourceId} bookingDate={query.bookingDate} />
              </div>
            )}

            {/* CTA link */}
            {query.resourceId && (
              <div className="av-u3">
                <Link to="/bookings/new" className="av-cta">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create a Booking for this Resource
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>

          {/* ── Right: info sidebar ── */}
          <div className="hidden xl:flex flex-col gap-5 w-72 shrink-0">

            {/* How to use card */}
            <div className="rounded-2xl p-5 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 3, height: 14, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.18em', color: '#374151', margin: 0 }}>
                  How to use
                </p>
              </div>
              <div>
                {[
                  { n: '01', label: 'Enter Resource ID', sub: 'Use the exact ID from the campus portal, e.g. HALL-A1' },
                  { n: '02', label: 'Pick a date',       sub: 'Choose the date you want to check for availability' },
                  { n: '03', label: 'Review slots',      sub: 'Occupied time slots are shown so you can plan around them' },
                  { n: '04', label: 'Create booking',    sub: 'Use the button below to request the resource directly' },
                ].map(({ n, label, sub }) => (
                  <div key={n} className="av-tip">
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#10B981',
                      flexShrink: 0, paddingTop: 2, minWidth: 24 }}>{n}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status legend card */}
            <div className="rounded-2xl p-5" style={{ background: '#0C1D11' }}>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 3, height: 14, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.22em', color: '#6EE7B7', margin: 0 }}>
                  Slot Status Guide
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { dot: '#34D399', label: 'Available',  sub: 'No booking exists for this slot' },
                  { dot: '#FBBF24', label: 'Pending',    sub: 'A request is awaiting admin review' },
                  { dot: '#F87171', label: 'Occupied',   sub: 'Slot is confirmed and unavailable' },
                ].map(({ dot, label, sub }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: dot,
                      flexShrink: 0, marginTop: 5,
                      boxShadow: `0 0 6px ${dot}80`,
                    }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#E5E7EB', marginBottom: 1 }}>{label}</p>
                      <p style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.4 }}>{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}