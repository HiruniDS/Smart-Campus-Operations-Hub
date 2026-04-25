const CARDS = [
  {
    key: 'total',
    label: 'Total Bookings',
    accent: '#2563eb',
    iconBg: '#eff6ff',
    iconPath: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    key: 'pending',
    label: 'Pending Review',
    accent: '#d97706',
    iconBg: '#fffbeb',
    iconPath: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
  },
  {
    key: 'approved',
    label: 'Approved',
    accent: '#059669',
    iconBg: '#ecfdf5',
    iconPath: (
      <>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </>
    ),
  },
  {
    key: 'other',
    label: 'Cancelled / Rejected',
    accent: '#dc2626',
    iconBg: '#fff1f2',
    iconPath: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </>
    ),
  },
];

export default function BookingSummaryCards({ bookings = [] }) {
  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    approved: bookings.filter((b) => b.status === 'APPROVED').length,
    other: bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED').length,
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map((c) => (
        <div
          key={c.key}
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
        >
          {/* Coloured top accent bar */}
          <div className="h-1" style={{ backgroundColor: c.accent }} />
          <div className="p-5">
            {/* SVG icon */}
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl mb-4"
              style={{ backgroundColor: c.iconBg }}
            >
              <svg
                width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke={c.accent}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                {c.iconPath}
              </svg>
            </div>
            {/* Count */}
            <div className="text-3xl font-extrabold tracking-tight" style={{ color: c.accent }}>
              {counts[c.key]}
            </div>
            {/* Label */}
            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {c.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}