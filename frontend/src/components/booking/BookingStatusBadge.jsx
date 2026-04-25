const STATUS_CONFIG = {
    PENDING: { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-1 ring-amber-300', label: 'Pending' },
    APPROVED: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-1 ring-emerald-300', label: 'Approved' },
    REJECTED: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', ring: 'ring-1 ring-red-300', label: 'Rejected' },
    CANCELLED: { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100', ring: 'ring-1 ring-slate-300', label: 'Cancelled' },
};

export default function BookingStatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}
