const CARDS = [
    { key: 'total', label: 'Total Bookings', icon: '📋', bg: 'linear-gradient(135deg,#1e3a5f,#1d4ed8)' },
    { key: 'pending', label: 'Pending', icon: '⏳', bg: 'linear-gradient(135deg,#92400e,#d97706)' },
    { key: 'approved', label: 'Approved', icon: '✅', bg: 'linear-gradient(135deg,#065f46,#059669)' },
    { key: 'other', label: 'Cancelled / Rejected', icon: '✖', bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)' },
];

export default function BookingSummaryCards({ bookings = [] }) {
    const counts = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === 'PENDING').length,
        approved: bookings.filter((b) => b.status === 'APPROVED').length,
        other: bookings.filter((b) => b.status === 'CANCELLED' || b.status === 'REJECTED').length,
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CARDS.map((c) => (
                <div
                    key={c.key}
                    className="rounded-xl p-5 text-white flex flex-col gap-1 shadow-sm"
                    style={{ background: c.bg }}
                >
                    <div className="text-2xl mb-1">{c.icon}</div>
                    <div className="text-4xl font-bold leading-none">{counts[c.key]}</div>
                    <div className="text-xs uppercase tracking-wider opacity-80 font-medium mt-0.5">{c.label}</div>
                </div>
            ))}
        </div>
    );
}
