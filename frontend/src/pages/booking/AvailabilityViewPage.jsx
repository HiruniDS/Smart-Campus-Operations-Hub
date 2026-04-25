import { useState } from 'react';
import { Link } from 'react-router-dom';
import AvailabilityPanel from '../../components/booking/AvailabilityPanel';
import { BkCard, BkLabel, inputCls, btnCls } from '../../components/booking/BkUI';

export default function AvailabilityViewPage() {
  const [resourceId, setResourceId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [query, setQuery] = useState({ resourceId: '', bookingDate: '' });

  const handleCheck = (e) => {
    e.preventDefault();
    setQuery({ resourceId, bookingDate });
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* ── Breadcrumbs ──────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          to="/bookings"
          className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
        >
          Dashboard
        </Link>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500 font-medium">Availability</span>
      </nav>

      {/* ── Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Check Availability
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-xl">
          View occupied time slots for any campus resource on a specific date
          before making a booking.
        </p>
      </div>

      {/* ── Query Card ───────────────────────────────── */}
      <BkCard className="max-w-lg w-full p-5 sm:p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <span className="text-lg">🔍</span>
          Resource Availability Query
        </h3>
        <form onSubmit={handleCheck} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <BkLabel required>Resource ID</BkLabel>
            <input
              className={inputCls(false)}
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="e.g. HALL-A1"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <BkLabel required>Date</BkLabel>
            <input
              type="date"
              className={inputCls(false)}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className={`${btnCls('primary')} self-start mt-1`}
          >
            Check Availability
          </button>
        </form>
      </BkCard>

      {/* ── Result Panel (now self‑contained) ────────── */}
      {(query.resourceId || query.bookingDate) && (
        <div className="max-w-lg w-full">
          <AvailabilityPanel
            resourceId={query.resourceId}
            bookingDate={query.bookingDate}
          />
        </div>
      )}

      {/* ── Quick-action link ────────────────────────── */}
      {query.resourceId && (
        <div>
          <Link to="/bookings/new" className={btnCls('primary')}>
            Create a Booking for this Resource →
          </Link>
        </div>
      )}
    </div>
  );
}