import { btnCls, inputSmCls } from './BkUI';

const LABEL = 'text-xs font-semibold uppercase tracking-widest text-slate-400';

export default function BookingFilterBar({ filters, onChange, showRequesterFilter = false }) {
    const set = (key, val) => onChange({ ...filters, [key]: val });

    return (
        <div className="flex items-end gap-4 flex-wrap">
            <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Status</label>
                <select
                    className={inputSmCls()}
                    value={filters.status || ''}
                    onChange={(e) => set('status', e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Date</label>
                <input
                    type="date"
                    className={inputSmCls()}
                    value={filters.bookingDate || ''}
                    onChange={(e) => set('bookingDate', e.target.value)}
                />
            </div>

            {showRequesterFilter && (
                <div className="flex flex-col gap-1.5">
                    <label className={LABEL}>Requester</label>
                    <input
                        className={inputSmCls()}
                        value={filters.requestedBy || ''}
                        onChange={(e) => set('requestedBy', e.target.value)}
                        placeholder="Username…"
                    />
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <label className={LABEL}>Resource</label>
                <input
                    className={inputSmCls()}
                    value={filters.resourceId || ''}
                    onChange={(e) => set('resourceId', e.target.value)}
                    placeholder="Resource ID…"
                />
            </div>

            {Object.values(filters).some(Boolean) && (
                <button
                    className={btnCls('ghost', 'sm')}
                    onClick={() => onChange({ status: '', bookingDate: '', requestedBy: '', resourceId: '' })}
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
