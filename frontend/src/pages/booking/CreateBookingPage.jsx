import { Link } from 'react-router-dom';
import BookingForm from '../../components/booking/BookingForm';
import createIllustration from '../../assets/booking/booking-create-side-illustration.png';

const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .bk-create-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes bkFadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .bk-fade-u0 { animation: bkFadeUp .35s ease both; }
  .bk-fade-u1 { animation: bkFadeUp .35s .07s ease both; }
  .bk-fade-u2 { animation: bkFadeUp .35s .14s ease both; }
`;

export default function CreateBookingPage() {
  return (
    <div className="bk-create-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{GLOBAL_STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="bk-fade-u0 flex items-center gap-1.5 text-xs mb-6">
          <Link
            to="/bookings"
            className="font-semibold transition-opacity hover:opacity-70"
            style={{ color: '#059669' }}
          >
            Dashboard
          </Link>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">New Booking</span>
        </nav>

        {/* ── Page header ────────────────────────────── */}
        <div className="bk-fade-u1 mb-8">
          {/* accent pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ background: 'rgba(16,185,129,0.12)', color: '#059669' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            New Request
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2"
            style={{ color: '#0C1D11' }}>
            Create Booking Request
          </h1>
          <p className="text-sm max-w-lg" style={{ color: '#6B7280', lineHeight: 1.7 }}>
            Fill in the details below to request a campus resource. Your request
            will be reviewed by an administrator before confirmation.
          </p>
        </div>

        {/* ── Form + Side panel ──────────────────────── */}
        <div className="bk-fade-u2 flex flex-col xl:flex-row gap-8 items-start">

          {/* Form card */}
          <div className="w-full xl:max-w-3xl">
            <BookingForm />
          </div>

          {/* Side panel */}
          <div className="hidden xl:flex shrink-0 flex-col gap-5 w-72">

            {/* Illustration card */}
            <div className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <img
                src={createIllustration}
                alt="Submit a campus resource booking request"
                loading="lazy"
                className="w-full object-cover"
                style={{ maxHeight: '280px' }}
              />
            </div>

            {/* Tips card */}
            <div className="rounded-2xl p-5" style={{ background: '#0C1D11' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full" style={{ background: '#10B981' }} />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.22em]"
                  style={{ color: '#6EE7B7' }}>
                  Quick Tips
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { n: '01', t: 'Use the exact Resource ID from the campus portal.' },
                  { n: '02', t: 'Check availability before picking a time slot.' },
                  { n: '03', t: 'State a clear purpose to speed up approval.' },
                ].map(({ n, t }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <span className="shrink-0 text-xs font-extrabold tabular-nums pt-0.5"
                      style={{ color: '#10B981' }}>{n}</span>
                    <div className="flex-1 h-px mt-2.5" style={{ background: 'rgba(16,185,129,0.15)' }} />
                    <p className="flex-[5] text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps card */}
            <div className="rounded-2xl p-5 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] mb-4"
                style={{ color: '#9CA3AF' }}>
                What happens next?
              </p>
              <div className="relative space-y-4">
                {/* connector line */}
                <div className="absolute left-3.5 top-4 bottom-4 w-px"
                  style={{ background: '#E5E7EB' }} />
                {[
                  { label: 'Submit request', sub: 'Your form is sent for review' },
                  { label: 'Admin review',   sub: 'Approved or rejected within 24h' },
                  { label: 'Confirmation',   sub: 'Slot confirmed in My Bookings' },
                ].map(({ label, sub }, i) => (
                  <div key={i} className="flex items-start gap-3 relative">
                    <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold z-10"
                      style={{ background: '#F0FDF4', color: '#059669', border: '2px solid #D1FAE5' }}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{sub}</p>
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