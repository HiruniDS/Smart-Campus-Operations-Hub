import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../api/bookingApi';
import AvailabilityPanel from './AvailabilityPanel';
import { BkBtn, BkLabel, BkFieldError, BkServerError, BkSuccessBanner, inputCls } from './BkUI';

const RESOURCE_TYPES = ['LECTURE_HALL', 'LAB', 'SEMINAR_ROOM', 'SPORTS_FACILITY', 'STUDY_ROOM', 'OTHER'];

const INITIAL = {
  resourceId: '',
  resourceName: '',
  resourceType: '',
  location: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  expectedAttendees: '',
};

function validate(form) {
  const errors = {};
  if (!form.resourceId.trim()) errors.resourceId = 'Resource ID is required.';
  if (!form.resourceName.trim()) errors.resourceName = 'Resource name is required.';
  if (!form.resourceType) errors.resourceType = 'Resource type is required.';
  if (!form.location.trim()) errors.location = 'Location is required.';
  if (!form.bookingDate) errors.bookingDate = 'Booking date is required.';
  if (!form.startTime) errors.startTime = 'Start time is required.';
  if (!form.endTime) errors.endTime = 'End time is required.';
  if (form.startTime && form.endTime && form.endTime <= form.startTime)
    errors.endTime = 'End time must be after start time.';
  if (!form.purpose.trim()) errors.purpose = 'Purpose is required.';
  if (!form.expectedAttendees || Number(form.expectedAttendees) < 1)
    errors.expectedAttendees = 'Expected attendees must be at least 1.';
  return errors;
}

// ── Reusable section layout ────────────────────────
function Section({ title, children }) {
  return (
    <div className="p-5 sm:p-6 border-b border-slate-100 last:border-b-0 space-y-5">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-l-4 border-blue-500 pl-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

// Field wrapper to reduce repetition
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <BkLabel required={required}>{label}</BkLabel>
      {children}
      <BkFieldError message={error} />
    </div>
  );
}

export default function BookingForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAvail, setShowAvail] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError('');
    setSubmitting(true);
    try {
      const payload = { ...form, expectedAttendees: Number(form.expectedAttendees) };
      const booking = await createBooking(payload);
      setSuccess(true);
      setTimeout(() => navigate(`/bookings/${booking.id}`), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.join(', ') ||
        'Booking failed. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ────────────────────────────────
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <div className="flex flex-col items-center gap-4 p-10 bg-white border border-emerald-200 rounded-2xl shadow-lg animate-[fadeInUp_0.4s_ease-out] max-w-md w-full text-center">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold text-slate-800">Booking request submitted!</h2>
          <p className="text-sm text-slate-500">Redirecting to your booking details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
        <BkServerError message={serverError} />

        {/* ── Resource Information ──────────────────────── */}
        <Section title="Resource Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Resource ID" required error={errors.resourceId}>
              <input
                className={inputCls(!!errors.resourceId)}
                value={form.resourceId}
                onChange={(e) => set('resourceId', e.target.value)}
                placeholder="e.g. HALL-A1"
              />
            </Field>
            <Field label="Resource Name" required error={errors.resourceName}>
              <input
                className={inputCls(!!errors.resourceName)}
                value={form.resourceName}
                onChange={(e) => set('resourceName', e.target.value)}
                placeholder="e.g. Engineering Lecture Hall A"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Resource Type" required error={errors.resourceType}>
              <select
                className={inputCls(!!errors.resourceType)}
                value={form.resourceType}
                onChange={(e) => set('resourceType', e.target.value)}
              >
                <option value="">Select type…</option>
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </Field>
            <Field label="Location" required error={errors.location}>
              <input
                className={inputCls(!!errors.location)}
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. Block C, Floor 2"
              />
            </Field>
          </div>
        </Section>

        {/* ── Schedule ────────────────────────────────── */}
        <Section title="Schedule">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date" required error={errors.bookingDate}>
              <input
                type="date"
                className={inputCls(!!errors.bookingDate)}
                value={form.bookingDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => set('bookingDate', e.target.value)}
              />
            </Field>
            <Field label="Start Time" required error={errors.startTime}>
              <input
                type="time"
                className={inputCls(!!errors.startTime)}
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </Field>
            <Field label="End Time" required error={errors.endTime}>
              <input
                type="time"
                className={inputCls(!!errors.endTime)}
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <BkBtn
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAvail((v) => !v)}
            >
              {showAvail ? 'Hide' : 'Check'} Availability
            </BkBtn>
            {!form.resourceId && (
              <span className="text-xs text-slate-400 animate-pulse">
                Enter a Resource ID above first.
              </span>
            )}
          </div>

          {showAvail && (
            <AvailabilityPanel resourceId={form.resourceId} bookingDate={form.bookingDate} />
          )}
        </Section>

        {/* ── Details ─────────────────────────────────── */}
        <Section title="Details">
          <Field label="Purpose" required error={errors.purpose}>
            <textarea
              className={`${inputCls(!!errors.purpose)} resize-y min-h-[100px]`}
              rows={3}
              value={form.purpose}
              onChange={(e) => set('purpose', e.target.value)}
              placeholder="Describe the purpose of this booking…"
            />
          </Field>
          <div className="max-w-[200px]">
            <Field label="Expected Attendees" required error={errors.expectedAttendees}>
              <input
                type="number"
                min={1}
                className={inputCls(!!errors.expectedAttendees)}
                value={form.expectedAttendees}
                onChange={(e) => set('expectedAttendees', e.target.value)}
                placeholder="e.g. 30"
              />
            </Field>
          </div>
        </Section>

        {/* ── Footer ──────────────────────────────────── */}
        <div className="flex justify-end gap-3 p-5 sm:p-6 bg-slate-50/50 border-t border-slate-100">
          <BkBtn type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </BkBtn>
          <BkBtn type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Booking Request'}
          </BkBtn>
        </div>
      </form>
    </div>
  );
}