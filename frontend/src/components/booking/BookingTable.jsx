import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';
import { btnCls } from './BkUI';

// ── Column classes ────────────────────────────────
const TH =
  'py-3.5 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 first:rounded-tl-xl last:rounded-tr-xl';
const TD = 'py-3.5 px-4 border-b border-slate-100/80 align-middle';

export default function BookingTable({ bookings, actions }) {
  const isEmpty = !bookings || bookings.length === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={TH}>Resource</th>
              <th className={TH}>Date</th>
              <th className={TH}>Time</th>
              <th className={TH}>Requester</th>
              <th className={TH}>Status</th>
              <th className={TH}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-4xl opacity-60">📋</div>
                    <p className="text-sm font-medium text-slate-500">No bookings to display</p>
                    <p className="text-xs text-slate-400 -mt-1">
                      Bookings will appear here once created.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b.id}
                  className="group hover:bg-blue-50/40 transition-colors duration-150"
                >
                  <td className={TD}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {b.resourceName}
                      </span>
                      <span className="text-xs text-slate-400 font-mono tracking-tight">
                        {b.resourceId}
                      </span>
                    </div>
                  </td>
                  <td className={`${TD} font-mono text-slate-500 text-xs`}>
                    {b.bookingDate}
                  </td>
                  <td className={`${TD} font-mono text-slate-500 text-xs`}>
                    {b.startTime} – {b.endTime}
                  </td>
                  <td className={`${TD} text-slate-500 font-medium`}>
                    {b.requestedBy}
                  </td>
                  <td className={TD}>
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className={TD}>
                    <div className="flex gap-1.5 items-center">
                      <Link
                        to={`/bookings/${b.id}`}
                        className={btnCls('outline', 'xs')}
                      >
                        View
                      </Link>
                      {actions && actions(b)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}