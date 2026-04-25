import { btnCls, inputSmCls } from './BkUI';

const LABEL =
  'text-xs font-bold uppercase tracking-widest text-slate-400';

export default function BookingFilterBar({
  filters,
  onChange,
  showRequesterFilter = false,
}) {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 sm:p-5">
      <div className="flex items-end gap-4 flex-wrap">
        {/* Status */}
        <div className="flex flex-col gap-1.5 min-w-[120px]">
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

        {/* Date */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className={LABEL}>Date</label>
          <input
            type="date"
            className={inputSmCls()}
            value={filters.bookingDate || ''}
            onChange={(e) => set('bookingDate', e.target.value)}
          />
        </div>

        {/* Requester (conditional) */}
        {showRequesterFilter && (
          <div className="flex flex-col gap-1.5 min-w-[150px]">
            <label className={LABEL}>Requester</label>
            <input
              className={inputSmCls()}
              value={filters.requestedBy || ''}
              onChange={(e) => set('requestedBy', e.target.value)}
              placeholder="Username…"
            />
          </div>
        )}

        {/* Resource */}
        <div className="flex flex-col gap-1.5 min-w-[150px]">
          <label className={LABEL}>Resource</label>
          <input
            className={inputSmCls()}
            value={filters.resourceId || ''}
            onChange={(e) => set('resourceId', e.target.value)}
            placeholder="Resource ID…"
          />
        </div>

        {/* Clear Filters */}
        {hasFilters && (
          <div className="flex flex-col gap-1.5">
            <span className="invisible text-xs"> </span> {/* spacer */}
            <button
              className={btnCls('ghost', 'sm') + ' inline-flex items-center gap-1.5'}
              onClick={() =>
                onChange({
                  status: '',
                  bookingDate: '',
                  requestedBy: '',
                  resourceId: '',
                })
              }
            >
              <span className="text-base leading-none">↺</span>
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}