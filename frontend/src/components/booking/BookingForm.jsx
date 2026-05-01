import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createBooking } from '../../api/bookingApi';
import AvailabilityPanel from './AvailabilityPanel';
import { BkLabel, BkFieldError, BkServerError } from './BkUI';

/* ─── Constants ───────────────────────────────────────── */
const RESOURCE_TYPES = [
  'LECTURE_HALL', 'LAB', 'SEMINAR_ROOM',
  'SPORTS_FACILITY', 'STUDY_ROOM', 'OTHER',
];

const INITIAL = {
  resourceId: '', resourceName: '', resourceType: '',
  location: '', bookingDate: '', startTime: '',
  endTime: '', purpose: '', expectedAttendees: '',
};

/* ─── Inline styles ───────────────────────────────────── */
const STYLE = `
  .bkf-input {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 10px;
    border: 1.5px solid #E5E7EB;
    background: #FAFAF8;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: border-color .15s, box-shadow .15s;
    font-family: inherit;
  }
  .bkf-input::placeholder { color: #C0BBB0; }
  .bkf-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    background: #fff;
  }
  .bkf-input-err {
    border-color: #F87171 !important;
    box-shadow: 0 0 0 3px rgba(248,113,113,0.1) !important;
  }
  .bkf-select { appearance: none; cursor: pointer; }
  .bkf-submit {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 28px; border-radius: 12px; border: none; cursor: pointer;
    font-size: 14px; font-weight: 700; color: #fff; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 4px 14px rgba(16,185,129,0.32);
    transition: filter .15s, transform .15s;
  }
  .bkf-submit:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .bkf-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
  .bkf-cancel {
    display: inline-flex; align-items: center;
    padding: 11px 22px; border-radius: 12px; cursor: pointer;
    font-size: 14px; font-weight: 600; font-family: inherit;
    background: transparent; border: 1.5px solid #E5E7EB; color: #6B7280;
    transition: background .15s, border-color .15s;
  }
  .bkf-cancel:hover { background: #F5F3EE; border-color: #D1D5DB; }
  .bkf-avail-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 18px; border-radius: 10px; cursor: pointer;
    font-size: 13px; font-weight: 600; font-family: inherit;
    background: #F0FDF4; color: #059669;
    border: 1.5px solid #A7F3D0;
    transition: background .15s;
  }
  .bkf-avail-btn:hover { background: #D1FAE5; }
  @keyframes bkfFadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .bkf-success { animation: bkfFadeUp .4s ease both; }
`;

/* ─── Validation ──────────────────────────────────────── */
function validate(form) {
  const e = {};
  if (!form.resourceId.trim()) e.resourceId = 'Resource ID is required.';
  if (!form.resourceName.trim()) e.resourceName = 'Resource name is required.';
  if (!form.resourceType) e.resourceType = 'Resource type is required.';
  if (!form.location.trim()) e.location = 'Location is required.';
  if (!form.bookingDate) e.bookingDate = 'Booking date is required.';
  if (!form.startTime) e.startTime = 'Start time is required.';
  if (!form.endTime) e.endTime = 'End time is required.';
  if (form.startTime && form.endTime && form.endTime <= form.startTime)
    e.endTime = 'End time must be after start time.';
  if (!form.purpose.trim()) e.purpose = 'Purpose is required.';
  if (!form.expectedAttendees || Number(form.expectedAttendees) < 1)
    e.expectedAttendees = 'Must be at least 1.';
  return e;
}

/* ─── Section header ──────────────────────────────────── */
function Section({ icon, title, children }) {
  return (
    <div style={{ borderBottom: '1px solid #F0EDE6', padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
        <div style={{
          width: 28, height: 28, borderRadius: 8, background: '#F0FDF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
        <h2 style={{
          fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
          letterSpacing: '0.18em', color: '#374151', margin: 0,
        }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ─── Field wrapper ───────────────────────────────────── */
function Field({ label, required, error, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <BkLabel required={required}>{label}</BkLabel>
      {children}
      <BkFieldError message={error} />
    </div>
  );
}

/* ─── Two-col grid helper (responsive) ───────────────── */
function Grid2({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Pre-fill from facility link (query params)
  const preFilledFacilityId = searchParams.get('facilityId') || '';
  const preFilledFacilityName = searchParams.get('facilityName') || '';
  const preFilledResourceType = searchParams.get('resourceType') || '';
  const preFilledLocation = searchParams.get('location') || '';
  const isFacilityPreFilled = !!preFilledFacilityId;

  const [form, setForm] = useState({
    ...INITIAL,
    resourceId: preFilledFacilityId,
    resourceName: preFilledFacilityName,
    resourceType: preFilledResourceType,
    location: preFilledLocation,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAvail, setShowAvail] = useState(false);

  // Sync if user navigates between facilities without unmounting
  useEffect(() => {
    if (preFilledFacilityId) {
      setForm((f) => ({
        ...f,
        resourceId: preFilledFacilityId,
        resourceName: preFilledFacilityName,
        resourceType: preFilledResourceType,
        location: preFilledLocation,
      }));
    }
  }, [preFilledFacilityId, preFilledFacilityName, preFilledResourceType, preFilledLocation]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setServerError('');
    setSubmitting(true);
    try {
      const payload = { ...form, expectedAttendees: Number(form.expectedAttendees) };
      const booking = await createBooking(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/bookings/${booking.id}`), 1600);
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join(', ') ||
        'Booking failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const ic = (hasErr) => `bkf-input${hasErr ? ' bkf-input-err' : ''}`;

  /* ── Success screen ─────────────────────────────────── */
  if (success) {
    return (
      <>
        <style>{STYLE}</style>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 24px' }}>
          <div className="bkf-success" style={{
            background: '#fff', border: '1px solid #A7F3D0', borderRadius: 20,
            padding: '48px 40px', maxWidth: 400, width: '100%', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(16,185,129,0.12)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#F0FDF4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0C1D11', marginBottom: 8 }}>
              Booking Submitted!
            </h2>
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
              Your request is under review. Redirecting to booking details…
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ── Main form ──────────────────────────────────────── */
  return (
    <>
      <style>{STYLE}</style>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        overflow: 'hidden',
      }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* server error */}
          <BkServerError message={serverError} />

          {/* ── Section: Resource Information ─────────── */}
          <Section
            title="Resource Information"
            icon={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>}
          >
            {isFacilityPreFilled && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', marginBottom: 16,
                background: '#F0FDF4', borderRadius: 10,
                border: '1.5px solid #A7F3D0', fontSize: 13,
                color: '#065F46', fontWeight: 600,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Facility pre-selected from the catalogue. Fields below are locked.
              </div>
            )}
            <Grid2>
              <Field label="Resource ID" required error={errors.resourceId}>
                <input className={ic(!!errors.resourceId)} value={form.resourceId}
                  readOnly={isFacilityPreFilled}
                  style={isFacilityPreFilled ? { background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' } : {}}
                  onChange={(e) => !isFacilityPreFilled && set('resourceId', e.target.value)}
                  placeholder="e.g. HALL-A1" />
              </Field>
              <Field label="Resource Name" required error={errors.resourceName}>
                <input className={ic(!!errors.resourceName)} value={form.resourceName}
                  readOnly={isFacilityPreFilled}
                  style={isFacilityPreFilled ? { background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' } : {}}
                  onChange={(e) => !isFacilityPreFilled && set('resourceName', e.target.value)}
                  placeholder="e.g. Engineering Lecture Hall A" />
              </Field>
            </Grid2>
            <div style={{ height: 14 }} />
            <Grid2>
              <Field label="Resource Type" required error={errors.resourceType}>
                <div style={{ position: 'relative' }}>
                  <select className={`${ic(!!errors.resourceType)} bkf-select`}
                    value={form.resourceType}
                    disabled={isFacilityPreFilled}
                    style={isFacilityPreFilled ? { background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' } : {}}
                    onChange={(e) => !isFacilityPreFilled && set('resourceType', e.target.value)}>
                    <option value="">Select type…</option>
                    {RESOURCE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <svg style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </Field>
              <Field label="Location" required error={errors.location}>
                <input className={ic(!!errors.location)} value={form.location}
                  readOnly={isFacilityPreFilled}
                  style={isFacilityPreFilled ? { background: '#F9FAFB', color: '#6B7280', cursor: 'not-allowed' } : {}}
                  onChange={(e) => !isFacilityPreFilled && set('location', e.target.value)}
                  placeholder="e.g. Block C, Floor 2" />
              </Field>
            </Grid2>
          </Section>

          {/* ── Section: Schedule ─────────────────────── */}
          <Section
            title="Schedule"
            icon={<><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Date" required error={errors.bookingDate}>
                <input type="date" className={ic(!!errors.bookingDate)} value={form.bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => set('bookingDate', e.target.value)} />
              </Field>
              <Field label="Start Time" required error={errors.startTime}>
                <input type="time" className={ic(!!errors.startTime)} value={form.startTime}
                  onChange={(e) => set('startTime', e.target.value)} />
              </Field>
              <Field label="End Time" required error={errors.endTime}>
                <input type="time" className={ic(!!errors.endTime)} value={form.endTime}
                  onChange={(e) => set('endTime', e.target.value)} />
              </Field>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <button type="button" className="bkf-avail-btn"
                onClick={() => setShowAvail((v) => !v)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {showAvail ? 'Hide' : 'Check'} Availability
              </button>
              {!form.resourceId && (
                <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                  Enter a Resource ID above first.
                </span>
              )}
            </div>

            {showAvail && (
              <div style={{ marginTop: 16 }}>
                <AvailabilityPanel resourceId={form.resourceId} bookingDate={form.bookingDate} />
              </div>
            )}
          </Section>

          {/* ── Section: Details ──────────────────────── */}
          <Section
            title="Details"
            icon={<><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>}
          >
            <Field label="Purpose" required error={errors.purpose}>
              <textarea
                className={ic(!!errors.purpose)}
                style={{ resize: 'vertical', minHeight: 100, lineHeight: 1.6 }}
                rows={3}
                value={form.purpose}
                onChange={(e) => set('purpose', e.target.value)}
                placeholder="Describe the purpose of this booking…"
              />
            </Field>
            <div style={{ height: 14 }} />
            <Field label="Expected Attendees" required error={errors.expectedAttendees}
              style={{ maxWidth: 200 }}>
              <input type="number" min={1} className={ic(!!errors.expectedAttendees)}
                value={form.expectedAttendees}
                onChange={(e) => set('expectedAttendees', e.target.value)}
                placeholder="e.g. 30" />
            </Field>
          </Section>

          {/* ── Footer ────────────────────────────────── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 12,
            padding: '20px 28px',
            background: '#FAFAF8',
            borderTop: '1px solid #F0EDE6',
          }}>
            <button type="button" className="bkf-cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="bkf-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  Submit Booking Request
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}