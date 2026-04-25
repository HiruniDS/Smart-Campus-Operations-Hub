import { useState, useEffect, useCallback } from 'react';
import { checkAvailability } from '../../api/bookingApi';
import { LoadingState, ErrorState } from './BookingStates';

const SLOT_CLS = {
  PENDING:
    'bg-amber-50/80 border-amber-200/90 text-amber-800',
  APPROVED:
    'bg-emerald-50/80 border-emerald-200/90 text-emerald-800',
  default:
    'bg-slate-50/80 border-slate-200 text-slate-600',
};

export default function AvailabilityPanel({ resourceId, bookingDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!resourceId || !bookingDate) return;
    setLoading(true);
    setError('');
    try {
      const result = await checkAvailability(resourceId, bookingDate);
      setData(result);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Could not fetch availability.'
      );
    } finally {
      setLoading(false);
    }
  }, [resourceId, bookingDate]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Prompt when missing params ──────────────────────
  if (!resourceId || !bookingDate) {
    return (
      <div className="mt-4 p-6 bg-slate-50/80 border border-slate-200 rounded-2xl text-center">
        <div className="text-3xl mb-2 opacity-60">🔍</div>
        <p className="text-sm font-medium text-slate-500">
          Enter a Resource ID and date to check availability.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingState message="Checking availability…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const slots = data.occupiedSlots ?? [];

  // Determine overall availability badge
  const availabilityBadge = data.available
    ? {
        dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)] animate-pulse',
        text: 'text-emerald-800',
        bg: 'bg-emerald-50/80 ring-1 ring-emerald-300/80',
        label: 'Available',
      }
    : {
        dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)]',
        text: 'text-amber-800',
        bg: 'bg-amber-50/80 ring-1 ring-amber-300/80',
        label: 'Has Bookings',
      };

  return (
    <div className="mt-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100/80 bg-slate-50/60">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-900 font-mono text-sm">
            {data.resourceId}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${availabilityBadge.bg} ${availabilityBadge.text}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${availabilityBadge.dot}`}
            />
            {availabilityBadge.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-mono">{data.bookingDate}</p>
      </div>

      {/* Summary */}
      <div className="p-4 sm:p-5 text-sm text-slate-600 font-medium">
        {data.summary}
      </div>

      {/* Occupied Slots */}
      {slots.length > 0 && (
        <div className="px-4 sm:px-5 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 pl-1">
            Occupied Slots
          </p>
          <div className="flex flex-col gap-2">
            {slots.map((slot, i) => {
              const slotStyle = SLOT_CLS[slot.status] || SLOT_CLS.default;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${slotStyle}`}
                >
                  <span className="font-mono text-sm text-slate-800 font-semibold">
                    {slot.startTime} – {slot.endTime}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                    {slot.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No occupied slots */}
      {slots.length === 0 && (
        <div className="px-4 sm:px-5 pb-5 text-sm font-medium text-emerald-700 flex items-center gap-2">
          <span className="text-base">✓</span> All time slots are available for this date.
        </div>
      )}
    </div>
  );
}