import { useState } from 'react';
import BookingModal from './BookingModal';
import { BkBtn, BkLabel, BkFieldError, inputCls } from './BkUI';

export function ApprovalModal({ onConfirm, onClose, loading }) {
    const [reviewReason, setReviewReason] = useState('');

    return (
        <BookingModal title="✅ Approve Booking" onClose={onClose}>
            <p className="m-0 text-slate-500 text-sm">
                Optionally provide an approval note for the requester.
            </p>
            <div className="flex flex-col gap-1.5">
                <BkLabel>Review Note (optional)</BkLabel>
                <textarea
                    className={`${inputCls()} resize-y min-h-[72px]`}
                    rows={3}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="e.g. Approved – room is available and request looks valid."
                />
            </div>
            <div className="flex justify-end gap-2.5">
                <BkBtn variant="ghost" onClick={onClose} disabled={loading}>Cancel</BkBtn>
                <BkBtn variant="success" onClick={() => onConfirm(reviewReason)} disabled={loading}>
                    {loading ? 'Approving…' : 'Approve Booking'}
                </BkBtn>
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
        <BookingModal title="❌ Reject Booking" onClose={onClose}>
            <p className="m-0 text-slate-500 text-sm">
                Please provide a reason for rejecting this booking request.
            </p>
            <div className="flex flex-col gap-1.5">
                <BkLabel required>Reason</BkLabel>
                <textarea
                    className={`${inputCls(!!error)} resize-y min-h-[72px]`}
                    rows={3}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                    placeholder="e.g. The room is unavailable due to maintenance."
                />
                <BkFieldError message={error} />
            </div>
            <div className="flex justify-end gap-2.5">
                <BkBtn variant="ghost" onClick={onClose} disabled={loading}>Cancel</BkBtn>
                <BkBtn variant="danger" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Rejecting…' : 'Reject Booking'}
                </BkBtn>
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
        <BookingModal title="🚫 Cancel Booking" onClose={onClose}>
            <p className="m-0 text-slate-500 text-sm">
                Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex flex-col gap-1.5">
                <BkLabel required>Reason</BkLabel>
                <textarea
                    className={`${inputCls(!!error)} resize-y min-h-[72px]`}
                    rows={3}
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); setError(''); }}
                    placeholder="e.g. Plans have changed and the room is no longer needed."
                />
                <BkFieldError message={error} />
            </div>
            <div className="flex justify-end gap-2.5">
                <BkBtn variant="ghost" onClick={onClose} disabled={loading}>Keep Booking</BkBtn>
                <BkBtn variant="danger" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Cancelling…' : 'Cancel Booking'}
                </BkBtn>
            </div>
        </BookingModal>
    );
}
