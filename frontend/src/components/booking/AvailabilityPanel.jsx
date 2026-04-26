import { useState, useEffect, useCallback } from 'react';
import { checkAvailability } from '../../api/bookingApi';
import { LoadingState, ErrorState } from './BookingStates';
import availabilityPromptImg from '../../assets/booking/booking-availability-prompt.png';

/* ── per-status display config ──────────────────────────── */
const STATUS_CFG = {
  APPROVED: {
    label: 'Confirmed',
    rowBg: '#F0FDF4', rowBorder: '#BBF7D0',
    badgeBg: '#D1FAE5', badgeText: '#065F46',
    dot: '#10B981',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  PENDING: {
    label: 'Pending Approval',
    rowBg: '#FFFBEB', rowBorder: '#FDE68A',
    badgeBg: '#FEF3C7', badgeText: '#92400E',
    dot: '#F59E0B',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
};

const DEFAULT_CFG = {
  label: 'Booked',
  rowBg: '#F8FAFC', rowBorder: '#E2E8F0',
  badgeBg: '#F1F5F9', badgeText: '#374151',
  dot: '#94A3B8',
  icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
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
      setError(err?.response?.data?.message || 'Could not fetch availability.');
    } finally {
      setLoading(false);
    }
  }, [resourceId, bookingDate]);

  useEffect(() => { load(); }, [load]);

  /* ── Prompt state ── */
  if (!resourceId || !bookingDate) {
    return (
      <div style={{
        marginTop: 16, padding: 24, background: '#F8FAFC',
        border: '1px solid #E2E8F0', borderRadius: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center',
      }}>
        <img src={availabilityPromptImg} alt="" width="200" loading="lazy" style={{ opacity: 0.85 }} />
        <p style={{ fontSize: 14, fontWeight: 500, color: '#64748B', margin: 0 }}>
          Enter a Resource ID and date to check availability.
        </p>
      </div>
    );
  }

  if (loading) return <LoadingState message="Checking availability…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const slots = data.occupiedSlots ?? [];

  /* human-readable date */
  const fmtDate = (() => {
    try {
      return new Date(data.bookingDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
    } catch {
      return data.bookingDate;
    }
  })();

  return (
    <div style={{
      marginTop: 16, background: '#fff',
      border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #F0EDE6', background: '#FAFAF8',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: '#F0FDF4',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontWeight: 500 }}>Resource ID</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, fontFamily: 'monospace' }}>
              {data.resourceId}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, fontWeight: 500 }}>Date</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 }}>{fmtDate}</p>
        </div>
      </div>

      {/* ── Status banner ──────────────────────────────────── */}
      <div style={{
        padding: '11px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid #F0EDE6',
        background: slots.length === 0 ? '#F0FDF4' : '#FFFBEB',
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: slots.length === 0 ? '#10B981' : '#F59E0B',
          boxShadow: slots.length === 0
            ? '0 0 0 3px rgba(16,185,129,0.18)'
            : '0 0 0 3px rgba(245,158,11,0.18)',
          display: 'inline-block',
        }} />
        <p style={{
          fontSize: 13, fontWeight: 600, margin: 0,
          color: slots.length === 0 ? '#065F46' : '#92400E',
        }}>
          {slots.length === 0
            ? 'No bookings on this date — the resource is open all day'
            : `${slots.length} time slot${slots.length > 1 ? 's' : ''} already booked — other time ranges are still available`}
        </p>
      </div>

      {/* ── Booked slots list ──────────────────────────────── */}
      {slots.length > 0 && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#9CA3AF', margin: '0 0 6px 0',
          }}>
            Booked Time Slots
          </p>

          {slots.map((slot, i) => {
            const cfg = STATUS_CFG[slot.status] || DEFAULT_CFG;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10,
                background: cfg.rowBg, border: `1px solid ${cfg.rowBorder}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  {cfg.icon}
                  <span style={{
                    fontFamily: 'monospace', fontSize: 14,
                    fontWeight: 700, color: '#111827',
                  }}>
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                  background: cfg.badgeBg, color: cfg.badgeText, letterSpacing: '0.05em',
                }}>
                  {cfg.label}
                </span>
              </div>
            );
          })}

          {/* Info note */}
          <div style={{
            marginTop: 4, padding: '10px 14px', borderRadius: 10,
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p style={{ fontSize: 12, color: '#1D4ED8', margin: 0, lineHeight: 1.55 }}>
              Any time range that does <strong>not overlap</strong> with the slots above is still
              available to book. Attempting to book the same time slot will be rejected.
            </p>
          </div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────── */}
      {slots.length === 0 && (
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 10,
            background: '#F0FDF4', border: '1px solid #BBF7D0',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#065F46', margin: 0 }}>
              No bookings found for this resource on the selected date.
            </p>
          </div>
          <p style={{ fontSize: 12, color: '#6B7280', margin: 0, padding: '0 2px', lineHeight: 1.65 }}>
            <strong style={{ color: '#374151' }}>{fmtDate}</strong> is completely free.
            You can book any time slot for this resource on this day.
          </p>
        </div>
      )}
    </div>
  );
}