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

const SECTION = 'py-5 border-b border-slate-100 last:border-b-0 flex flex-col gap-4';
const SECTION_TITLE = 'text-xs font-bold uppercase tracking-widest text-slate-400';
const ROW2 = 'grid grid-cols-1 sm:grid-cols-2 gap-4';
const ROW3 = 'grid grid-cols-1 sm:grid-cols-3 gap-4';
const FIELD = 'flex flex-col gap-1.5';

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
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setErrors({});
        setServerError('');
        setSubmitting(true);
        try {
            const payload = { ...form, expectedAttendees: Number(form.expectedAttendees) };
            const booking = await createBooking(payload);
            setSuccess(true);
            setTimeout(() => navigate(`/bookings/${booking.id}`), 1200);
        } catch (err) {
            const msg = err?.response?.data?.message
                || err?.response?.data?.errors?.join(', ')
                || 'Booking failed. Please try again.';
            setServerError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <BkSuccessBanner icon="🎉">
                <strong>Booking request submitted!</strong>
                <p className="text-xs opacity-80 m-0 mt-0.5">Redirecting to your booking details…</p>
            </BkSuccessBanner>
        );
    }

    return (
        <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
            <BkServerError message={serverError} />

            {/* ── Resource Information ─────────────────────────────────── */}
            <div className={SECTION}>
                <h4 className={SECTION_TITLE}>Resource Information</h4>
                <div className={ROW2}>
                    <div className={FIELD}>
                        <BkLabel required>Resource ID</BkLabel>
                        <input
                            className={inputCls(!!errors.resourceId)}
                            value={form.resourceId}
                            onChange={(e) => set('resourceId', e.target.value)}
                            placeholder="e.g. HALL-A1"
                        />
                        <BkFieldError message={errors.resourceId} />
                    </div>
                    <div className={FIELD}>
                        <BkLabel required>Resource Name</BkLabel>
                        <input
                            className={inputCls(!!errors.resourceName)}
                            value={form.resourceName}
                            onChange={(e) => set('resourceName', e.target.value)}
                            placeholder="e.g. Engineering Lecture Hall A"
                        />
                        <BkFieldError message={errors.resourceName} />
                    </div>
                </div>
                <div className={ROW2}>
                    <div className={FIELD}>
                        <BkLabel required>Resource Type</BkLabel>
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
                        <BkFieldError message={errors.resourceType} />
                    </div>
                    <div className={FIELD}>
                        <BkLabel required>Location</BkLabel>
                        <input
                            className={inputCls(!!errors.location)}
                            value={form.location}
                            onChange={(e) => set('location', e.target.value)}
                            placeholder="e.g. Block C, Floor 2"
                        />
                        <BkFieldError message={errors.location} />
                    </div>
                </div>
            </div>

            {/* ── Schedule ─────────────────────────────────────────────── */}
            <div className={SECTION}>
                <h4 className={SECTION_TITLE}>Schedule</h4>
                <div className={ROW3}>
                    <div className={FIELD}>
                        <BkLabel required>Date</BkLabel>
                        <input
                            type="date"
                            className={inputCls(!!errors.bookingDate)}
                            value={form.bookingDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => set('bookingDate', e.target.value)}
                        />
                        <BkFieldError message={errors.bookingDate} />
                    </div>
                    <div className={FIELD}>
                        <BkLabel required>Start Time</BkLabel>
                        <input
                            type="time"
                            className={inputCls(!!errors.startTime)}
                            value={form.startTime}
                            onChange={(e) => set('startTime', e.target.value)}
                        />
                        <BkFieldError message={errors.startTime} />
                    </div>
                    <div className={FIELD}>
                        <BkLabel required>End Time</BkLabel>
                        <input
                            type="time"
                            className={inputCls(!!errors.endTime)}
                            value={form.endTime}
                            onChange={(e) => set('endTime', e.target.value)}
                        />
                        <BkFieldError message={errors.endTime} />
                    </div>
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
                        <span className="text-xs text-slate-400">Enter a Resource ID above first.</span>
                    )}
                </div>

                {showAvail && (
                    <AvailabilityPanel resourceId={form.resourceId} bookingDate={form.bookingDate} />
                )}
            </div>

            {/* ── Details ──────────────────────────────────────────────── */}
            <div className={SECTION}>
                <h4 className={SECTION_TITLE}>Details</h4>
                <div className={FIELD}>
                    <BkLabel required>Purpose</BkLabel>
                    <textarea
                        className={`${inputCls(!!errors.purpose)} resize-y min-h-[80px]`}
                        rows={3}
                        value={form.purpose}
                        onChange={(e) => set('purpose', e.target.value)}
                        placeholder="Describe the purpose of this booking…"
                    />
                    <BkFieldError message={errors.purpose} />
                </div>
                <div className={FIELD} style={{ maxWidth: 200 }}>
                    <BkLabel required>Expected Attendees</BkLabel>
                    <input
                        type="number"
                        min={1}
                        className={inputCls(!!errors.expectedAttendees)}
                        value={form.expectedAttendees}
                        onChange={(e) => set('expectedAttendees', e.target.value)}
                        placeholder="e.g. 30"
                    />
                    <BkFieldError message={errors.expectedAttendees} />
                </div>
            </div>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-5">
                <BkBtn type="button" variant="ghost" onClick={() => navigate(-1)}>
                    Cancel
                </BkBtn>
                <BkBtn type="submit" variant="primary" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Booking Request'}
                </BkBtn>
            </div>
        </form>
    );
}
