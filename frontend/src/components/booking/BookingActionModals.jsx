import { useState } from 'react';
import BookingModal from './BookingModal';

export function ApprovalModal({ onConfirm, onClose, loading }) {
    const [reviewReason, setReviewReason] = useState('');

    return (
        <BookingModal title="Approve Booking" onClose={onClose}>
            <p className="bk-modal-desc">
                Optionally provide an approval note for the requester.
            </p>
            <div className="bk-field">
                <label className="bk-label">Review Note (optional)</label>
                <textarea
                    className="bk-textarea"
                    rows={3}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="e.g. Approved – room is available and request looks valid."
                />
            </div>
            <div className="bk-modal-actions">
                <button className="bk-btn bk-btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button
                    className="bk-btn bk-btn-success"
                    onClick={() => onConfirm(reviewReason)}
                    disabled={loading}
                >
                    {loading ? 'Approving…' : 'Approve Booking'}
                </button>
            </div>
        </BookingModal>
    );
}

export function RejectionModal({ onConfirm, onClose, loading }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Rejection reason is required.');
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <BookingModal title="Reject Booking" onClose={onClose}>
            <p className="bk-modal-desc">
                Please provide a reason for rejecting this booking request.
            </p>
            <div className="bk-field">
                <label className="bk-label">Reason <span className="bk-required">*</span></label>
                <textarea
                    className={`bk-textarea ${error ? 'bk-input-error' : ''}`}
                    rows={3}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                    placeholder="e.g. The room is unavailable due to maintenance."
                />
                {error && <span className="bk-field-error">{error}</span>}
            </div>
            <div className="bk-modal-actions">
                <button className="bk-btn bk-btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button
                    className="bk-btn bk-btn-danger"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Rejecting…' : 'Reject Booking'}
                </button>
            </div>
        </BookingModal>
    );
}

export function CancellationModal({ onConfirm, onClose, loading }) {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            setError('Cancellation reason is required.');
            return;
        }
        onConfirm(reason.trim());
    };

    return (
        <BookingModal title="Cancel Booking" onClose={onClose}>
            <p className="bk-modal-desc">
                Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="bk-field">
                <label className="bk-label">Reason <span className="bk-required">*</span></label>
                <textarea
                    className={`bk-textarea ${error ? 'bk-input-error' : ''}`}
                    rows={3}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                    placeholder="e.g. Plans have changed and the room is no longer needed."
                />
                {error && <span className="bk-field-error">{error}</span>}
            </div>
            <div className="bk-modal-actions">
                <button className="bk-btn bk-btn-ghost" onClick={onClose} disabled={loading}>
                    Keep Booking
                </button>
                <button
                    className="bk-btn bk-btn-danger"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? 'Cancelling…' : 'Cancel Booking'}
                </button>
            </div>
        </BookingModal>
    );
}
