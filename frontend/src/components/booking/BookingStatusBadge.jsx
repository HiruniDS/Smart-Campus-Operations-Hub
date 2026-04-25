const STATUS_CONFIG = {
    PENDING: { label: 'Pending', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
    APPROVED: { label: 'Approved', color: '#065f46', bg: '#d1fae5', border: '#6ee7b7' },
    REJECTED: { label: 'Rejected', color: '#991b1b', bg: '#fee2e2', border: '#fca5a5' },
    CANCELLED: { label: 'Cancelled', color: '#374151', bg: '#f3f4f6', border: '#d1d5db' },
};

export default function BookingStatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: cfg.color,
                    display: 'inline-block',
                }}
            />
            {cfg.label}
        </span>
    );
}
