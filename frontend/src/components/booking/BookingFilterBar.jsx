export default function BookingFilterBar({ filters, onChange, showRequesterFilter = false }) {
    const set = (key, val) => onChange({ ...filters, [key]: val });

    return (
        <div className="bk-filter-bar">
            <div className="bk-filter-group">
                <label className="bk-filter-label">Status</label>
                <select className="bk-select bk-select-sm" value={filters.status || ''} onChange={(e) => set('status', e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="bk-filter-group">
                <label className="bk-filter-label">Date</label>
                <input
                    type="date"
                    className="bk-input bk-input-sm"
                    value={filters.bookingDate || ''}
                    onChange={(e) => set('bookingDate', e.target.value)}
                />
            </div>

            {showRequesterFilter && (
                <div className="bk-filter-group">
                    <label className="bk-filter-label">Requester</label>
                    <input
                        className="bk-input bk-input-sm"
                        value={filters.requestedBy || ''}
                        onChange={(e) => set('requestedBy', e.target.value)}
                        placeholder="Username…"
                    />
                </div>
            )}

            <div className="bk-filter-group">
                <label className="bk-filter-label">Resource</label>
                <input
                    className="bk-input bk-input-sm"
                    value={filters.resourceId || ''}
                    onChange={(e) => set('resourceId', e.target.value)}
                    placeholder="Resource ID…"
                />
            </div>

            {Object.values(filters).some(Boolean) && (
                <button
                    className="bk-btn bk-btn-ghost bk-btn-sm"
                    onClick={() => onChange({ status: '', bookingDate: '', requestedBy: '', resourceId: '' })}
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
