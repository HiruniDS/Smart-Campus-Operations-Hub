/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  .bkfb-root {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 18px;
    padding: 18px 22px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }
  .bkfb-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #9CA3AF;
    margin-bottom: 6px;
    display: block;
  }
  .bkfb-input {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1.5px solid #E5E7EB;
    background: #FAFAF8;
    font-size: 13px;
    color: #111827;
    outline: none;
    font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
  }
  .bkfb-input::placeholder { color: #C0BBB0; }
  .bkfb-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    background: #fff;
  }
  .bkfb-select { appearance: none; cursor: pointer; }
  .bkfb-select-wrap { position: relative; }
  .bkfb-select-caret {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%); pointer-events: none;
  }
  .bkfb-clear {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 8px 14px; border-radius: 10px; cursor: pointer;
    font-size: 12px; font-weight: 700; font-family: inherit;
    background: #FFF1F2; color: #E11D48;
    border: 1.5px solid #FECDD3;
    transition: background .15s;
    white-space: nowrap;
  }
  .bkfb-clear:hover { background: #FFE4E6; }
  .bkfb-divider {
    width: 1px; background: #F0EDE6; align-self: stretch; margin: 0 4px;
  }
`;

export default function BookingFilterBar({ filters, onChange, showRequesterFilter = false }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <style>{STYLE}</style>
      <div className="bkfb-root">

        {/* header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 14, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#374151' }}>
            Filter Bookings
          </span>
          {hasFilters && (
            <span style={{
              marginLeft: 6, fontSize: 10, fontWeight: 700,
              background: '#F0FDF4', color: '#059669',
              border: '1px solid #A7F3D0', borderRadius: 99,
              padding: '1px 8px',
            }}>
              Active
            </span>
          )}
        </div>

        {/* filter controls row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>

          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 130 }}>
            <label className="bkfb-label">Status</label>
            <div className="bkfb-select-wrap">
              <select className="bkfb-input bkfb-select"
                value={filters.status || ''}
                onChange={(e) => set('status', e.target.value)}>
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <span className="bkfb-select-caret">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>
          </div>

          {/* Date */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 155 }}>
            <label className="bkfb-label">Date</label>
            <input type="date" className="bkfb-input"
              value={filters.bookingDate || ''}
              onChange={(e) => set('bookingDate', e.target.value)} />
          </div>

          {/* Requester (conditional) */}
          {showRequesterFilter && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 155 }}>
              <label className="bkfb-label">Requester</label>
              <input className="bkfb-input"
                value={filters.requestedBy || ''}
                onChange={(e) => set('requestedBy', e.target.value)}
                placeholder="Username…" />
            </div>
          )}

          {/* Resource */}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 155 }}>
            <label className="bkfb-label">Resource ID</label>
            <input className="bkfb-input"
              value={filters.resourceId || ''}
              onChange={(e) => set('resourceId', e.target.value)}
              placeholder="e.g. HALL-A1…" />
          </div>

          {/* Divider + Clear */}
          {hasFilters && (
            <>
              <div className="bkfb-divider hidden sm:block" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* invisible spacer to align with inputs */}
                <span style={{ fontSize: 10, visibility: 'hidden', marginBottom: 6 }}>·</span>
                <button className="bkfb-clear"
                  onClick={() => onChange({ status: '', bookingDate: '', requestedBy: '', resourceId: '' })}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                  Clear Filters
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}