import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';
import { btnCls } from './BkUI';

const TH = 'py-3.5 px-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400';
const TD = 'py-3.5 px-4 border-b border-slate-100 align-middle';

export default function BookingTable({ bookings, actions }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-50 border-b-2 border-slate-200">
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
                    {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className={TD}>
                                <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-slate-800">{b.resourceName}</span>
                                    <span className="text-xs text-slate-400 font-mono">{b.resourceId}</span>
                                </div>
                            </td>
                            <td className={`${TD} font-mono text-slate-500 text-xs`}>{b.bookingDate}</td>
                            <td className={`${TD} font-mono text-slate-500 text-xs`}>{b.startTime} – {b.endTime}</td>
                            <td className={`${TD} text-slate-500 font-medium`}>{b.requestedBy}</td>
                            <td className={TD}><BookingStatusBadge status={b.status} /></td>
                            <td className={TD}>
                                <div className="flex gap-1.5 items-center">
                                    <Link to={`/bookings/${b.id}`} className={btnCls('outline', 'xs')}>
                                        View
                                    </Link>
                                    {actions && actions(b)}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
