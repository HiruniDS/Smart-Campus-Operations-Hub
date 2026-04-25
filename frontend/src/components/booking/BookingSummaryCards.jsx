export default function BookingSummaryCards({ bookings }) {
    const counts = { PENDING: 0, APPROVED: 0, REJECTED: 0, CANCELLED: 0 };
    bookings.forEach((b) => {
        if (counts[b.status] !== undefined) counts[b.status]++;
    });

    const cards = [
        {
            label: 'Total',
            value: bookings.length,
            icon: '📋',
            accent: '#1e3a5f',
            bg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%)',
        },
        {
            label: 'Pending',
            value: counts.PENDING,
            icon: '⏳',
            accent: '#92400e',
            bg: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
        },
        {
            label: 'Approved',
            value: counts.APPROVED,
            icon: '✅',
            accent: '#065f46',
            bg: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
        },
        {
            label: 'Cancelled / Rejected',
            value: counts.CANCELLED + counts.REJECTED,
            icon: '✖',
            accent: '#7f1d1d',
            bg: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
        },
    ];

    return (
        <div className="bk-summary-row">
            {cards.map((c) => (
                <div key={c.label} className="bk-summary-card" style={{ background: c.bg }}>
                    <div className="bk-summary-icon">{c.icon}</div>
                    <div className="bk-summary-value">{c.value}</div>
                    <div className="bk-summary-label">{c.label}</div>
                </div>
            ))}
        </div>
    );
}
