import { useState } from 'react';
import BookingModal from './BookingModal';
import { BkBtn, BkLabel, BkFieldError, inputCls } from './BkUI';

// ──────────────────────────────────────────
//  APPROVAL MODAL
// ──────────────────────────────────────────
export function ApprovalModal({ onConfirm, onClose, loading }) {
  const [reviewReason, setReviewReason] = useState('');

  return (
    <BookingModal
      title={
        <div className="flex items-center gap-2">
          <span className="text-emerald-500 text-xl">✅</span>
          <span className="text-slate-800">Approve Booking</span>
        </div>
      }
      onClose={onClose}
    >
      <div className="p-1">
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900 mb-5">
          <p className="font-medium">You are about to approve this booking.</p>
          <p className="text-xs text-emerald-700/80 mt-1">The requester will be notified and the slot will be reserved.</p>
        </div>

        <div className="flex flex-col gap-2">
          <BkLabel>Review Note (optional)</BkLabel>
          <textarea
            className={`${inputCls()} resize-y min-h-[80px]`}
            rows={3}
            value={reviewReason}
            onChange={(e) => setReviewReason(e.target.value)}
            placeholder="e.g. Approved – room is available and request looks valid."
          />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <BkBtn variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </BkBtn>
          <BkBtn
            variant="success"
            onClick={() => onConfirm(reviewReason)}
            disabled={loading}
          >
            {loading ? 'Approving…' : 'Approve Booking'}
          </BkBtn>
        </div>
      </div>
    </BookingModal>
  );
}

// ──────────────────────────────────────────
//  REJECTION MODAL
// ──────────────────────────────────────────
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
    <BookingModal
      title={
        <div className="flex items-center gap-2">
          <span className="text-rose-500 text-xl">❌</span>
          <span className="text-slate-800">Reject Booking</span>
        </div>
      }
      onClose={onClose}
    >
      <div className="p-1">
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 text-sm text-rose-900 mb-5">
          <p className="font-medium">This booking will be permanently rejected.</p>
          <p className="text-xs text-rose-700/80 mt-1">The requester will see the reason you provide below.</p>
        </div>

        <div className="flex flex-col gap-2">
          <BkLabel required>Reason</BkLabel>
          <textarea
            className={`${inputCls(!!error)} resize-y min-h-[80px]`}
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="e.g. The room is unavailable due to maintenance."
          />
          <BkFieldError message={error} />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <BkBtn variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </BkBtn>
          <BkBtn variant="danger" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Rejecting…' : 'Reject Booking'}
          </BkBtn>
        </div>
      </div>
    </BookingModal>
  );
}

// ──────────────────────────────────────────
//  CANCELLATION MODAL
// ──────────────────────────────────────────
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
    <BookingModal
      title={
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-xl">🚫</span>
          <span className="text-slate-800">Cancel Booking</span>
        </div>
      }
      onClose={onClose}
    >
      <div className="p-1">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 mb-5">
          <p className="font-medium">Are you sure you want to cancel?</p>
          <p className="text-xs text-amber-700/80 mt-1">This action cannot be undone. The slot will be released.</p>
        </div>

        <div className="flex flex-col gap-2">
          <BkLabel required>Reason</BkLabel>
          <textarea
            className={`${inputCls(!!error)} resize-y min-h-[80px]`}
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder="e.g. Plans have changed and the room is no longer needed."
          />
          <BkFieldError message={error} />
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <BkBtn variant="ghost" onClick={onClose} disabled={loading}>
            Keep Booking
          </BkBtn>
          <BkBtn variant="danger" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Cancelling…' : 'Cancel Booking'}
          </BkBtn>
        </div>
      </div>
    </BookingModal>
  );
}