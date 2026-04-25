const STATUS_CONFIG = {
  PENDING: {
    dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.4)] animate-pulse',
    text: 'text-amber-800',
    bg: 'bg-gradient-to-r from-amber-50 to-amber-100/80',
    ring: 'ring-1 ring-amber-300/80',
    label: 'Pending',
  },
  APPROVED: {
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]',
    text: 'text-emerald-800',
    bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100/80',
    ring: 'ring-1 ring-emerald-300/80',
    label: 'Approved',
  },
  REJECTED: {
    dot: 'bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.4)]',
    text: 'text-rose-800',
    bg: 'bg-gradient-to-r from-rose-50 to-rose-100/80',
    ring: 'ring-1 ring-rose-300/80',
    label: 'Rejected',
  },
  CANCELLED: {
    dot: 'bg-slate-400 shadow-[0_0_6px_rgba(148,163,184,0.4)]',
    text: 'text-slate-700',
    bg: 'bg-gradient-to-r from-slate-100 to-slate-200/80',
    ring: 'ring-1 ring-slate-300/80',
    label: 'Cancelled',
  },
};

export default function BookingStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm hover:scale-105 transition-transform duration-200 ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}