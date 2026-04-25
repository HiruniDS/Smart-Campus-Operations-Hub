import { BkCard } from './BkUI';

const CARDS = [
  {
    key: 'total',
    label: 'Total Bookings',
    icon: '📋',
    color: '#2563eb', // blue-600
    bg: 'bg-gradient-to-br from-blue-50 to-white',
    border: 'border-blue-200/70',
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: '⏳',
    color: '#d97706', // amber-600
    bg: 'bg-gradient-to-br from-amber-50 to-white',
    border: 'border-amber-200/70',
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: '✅',
    color: '#059669', // emerald-600
    bg: 'bg-gradient-to-br from-emerald-50 to-white',
    border: 'border-emerald-200/70',
  },
  {
    key: 'other',
    label: 'Cancelled / Rejected',
    icon: '✖',
    color: '#dc2626', // red-600
    bg: 'bg-gradient-to-br from-rose-50 to-white',
    border: 'border-rose-200/70',
  },
];

export default function BookingSummaryCards({ bookings = [] }) {
  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    approved: bookings.filter((b) => b.status === 'APPROVED').length,
    other: bookings.filter(
      (b) => b.status === 'CANCELLED' || b.status === 'REJECTED'
    ).length,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {CARDS.map((c) => (
        <BkCard
          key={c.key}
          className={`group relative p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${c.bg} border ${c.border} backdrop-blur-sm`}
        >
          {/* Icon circle */}
          <div
            className="flex items-center justify-center w-11 h-11 rounded-full text-xl mb-4"
            style={{ backgroundColor: `${c.color}20` }}   // 12% opacity solid color
          >
            <span>{c.icon}</span>
          </div>

          {/* Count */}
          <div
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: c.color }}
          >
            {counts[c.key]}
          </div>

          {/* Label */}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {c.label}
          </p>
        </BkCard>
      ))}
    </div>
  );
}