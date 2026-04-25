import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../api/bookingApi';
import AvailabilityPanel from './AvailabilityPanel';

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
            <div className="bk-success-banner">
                <span>🎉</span>
                <div>
                    <strong>Booking request submitted!</strong>
                    <p>Redirecting to your booking details…</p>
                </div>
            </div>
        );
    }

    return (
        <form className="bk-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
                <div className="bk-server-error">
                    <strong>⚠ {serverError}</strong>
                </div>
            )}

            <div className="bk-form-section">
                <h4 className="bk-form-section-title">Resource Information</h4>
                <div className="bk-row">
                    <div className="bk-field">
                        <label className="bk-label">Resource ID <span className="bk-required">*</span></label>
                        <input
                            className={`bk-input ${errors.resourceId ? 'bk-input-error' : ''}`}
                            value={form.resourceId}
                            onChange={(e) => set('resourceId', e.target.value)}
                            placeholder="e.g. HALL-A1"
                        />
                        {errors.resourceId && <span className="bk-field-error">{errors.resourceId}</span>}
                    </div>
                    <div className="bk-field">
                        <label className="bk-label">Resource Name <span className="bk-required">*</span></label>
                        <input
                            className={`bk-input ${errors.resourceName ? 'bk-input-error' : ''}`}
                            value={form.resourceName}
                            onChange={(e) => set('resourceName', e.target.value)}
                            placeholder="e.g. Engineering Lecture Hall A"
                        />
                        {errors.resourceName && <span className="bk-field-error">{errors.resourceName}</span>}
                    </div>
                </div>
                <div className="bk-row">
                    <div className="bk-field">
                        <label className="bk-label">Resource Type <span className="bk-required">*</span></label>
                        <select
                            className={`bk-select ${errors.resourceType ? 'bk-input-error' : ''}`}
                            value={form.resourceType}
                            onChange={(e) => set('resourceType', e.target.value)}
                        >
                            <option value="">Select type…</option>
                            {RESOURCE_TYPES.map((t) => (
                                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        {errors.resourceType && <span className="bk-field-error">{errors.resourceType}</span>}
                    </div>
                    <div className="bk-field">
                        <label className="bk-label">Location <span className="bk-required">*</span></label>
                        <input
                            className={`bk-input ${errors.location ? 'bk-input-error' : ''}`}
                            value={form.location}
                            onChange={(e) => set('location', e.target.value)}
                            placeholder="e.g. Block C, Floor 2"
                        />
                        {errors.location && <span className="bk-field-error">{errors.location}</span>}
                    </div>
                </div>
            </div>

            <div className="bk-form-section">
                <h4 className="bk-form-section-title">Schedule</h4>
                <div className="bk-row bk-row-3">
                    <div className="bk-field">
                        <label className="bk-label">Date <span className="bk-required">*</span></label>
                        <input
                            type="date"
                            className={`bk-input ${errors.bookingDate ? 'bk-input-error' : ''}`}
                            value={form.bookingDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => set('bookingDate', e.target.value)}
                        />
                        {errors.bookingDate && <span className="bk-field-error">{errors.bookingDate}</span>}
                    </div>
                    <div className="bk-field">
                        <label className="bk-label">Start Time <span className="bk-required">*</span></label>
                        <input
                            type="time"
                            className={`bk-input ${errors.startTime ? 'bk-input-error' : ''}`}
                            value={form.startTime}
                            onChange={(e) => set('startTime', e.target.value)}
                        />
                        {errors.startTime && <span className="bk-field-error">{errors.startTime}</span>}
                    </div>
                    <div className="bk-field">
                        <label className="bk-label">End Time <span className="bk-required">*</span></label>
                        <input
                            type="time"
                            className={`bk-input ${errors.endTime ? 'bk-input-error' : ''}`}
                            value={form.endTime}
                            onChange={(e) => set('endTime', e.target.value)}
                        />
                        {errors.endTime && <span className="bk-field-error">{errors.endTime}</span>}
                    </div>
                </div>

                <div className="bk-avail-toggle-row">
                    <button
                        type="button"
                        className="bk-btn bk-btn-outline bk-btn-sm"
                        onClick={() => setShowAvail((v) => !v)}
                    >
                        {showAvail ? 'Hide' : 'Check'} Availability
                    </button>
                    {!form.resourceId && <span className="bk-avail-hint">Enter a Resource ID above first.</span>}
                </div>

                {showAvail && (
                    <AvailabilityPanel
                        resourceId={form.resourceId}
                        bookingDate={form.bookingDate}
                    />
                )}
            </div>

            <div className="bk-form-section">
                <h4 className="bk-form-section-title">Details</h4>
                <div className="bk-field">
                    <label className="bk-label">Purpose <span className="bk-required">*</span></label>
                    <textarea
                        className={`bk-textarea ${errors.purpose ? 'bk-input-error' : ''}`}
                        rows={3}
                        value={form.purpose}
                        onChange={(e) => set('purpose', e.target.value)}
                        placeholder="Describe the purpose of this booking…"
                    />
                    {errors.purpose && <span className="bk-field-error">{errors.purpose}</span>}
                </div>
                <div className="bk-field" style={{ maxWidth: 200 }}>
                    <label className="bk-label">Expected Attendees <span className="bk-required">*</span></label>
                    <input
                        type="number"
                        min={1}
                        className={`bk-input ${errors.expectedAttendees ? 'bk-input-error' : ''}`}
                        value={form.expectedAttendees}
                        onChange={(e) => set('expectedAttendees', e.target.value)}
                        placeholder="e.g. 30"
                    />
                    {errors.expectedAttendees && (
                        <span className="bk-field-error">{errors.expectedAttendees}</span>
                    )}
                </div>
            </div>

            <div className="bk-form-footer">
                <button type="button" className="bk-btn bk-btn-ghost" onClick={() => navigate(-1)}>
                    Cancel
                </button>
                <button type="submit" className="bk-btn bk-btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting…' : 'Submit Booking Request'}
                </button>
            </div>
        </form>
    );
}
