import { Link } from 'react-router-dom';
import BookingStatusBadge from './BookingStatusBadge';

export default function BookingTable({ bookings, actions }) {
    return (
        <div className="bk-table-wrap">
            <table className="bk-table">
                <thead>
                    <tr>
                        <th>Resource</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Requester</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.id} className="bk-table-row">
                            <td>
                                <div className="bk-table-resource">
                                    <span className="bk-table-resource-name">{b.resourceName}</span>
                                    <span className="bk-table-resource-id">{b.resourceId}</span>
                                </div>
                            </td>
                            <td className="bk-table-date">{b.bookingDate}</td>
                            <td className="bk-table-time">{b.startTime} – {b.endTime}</td>
                            <td className="bk-table-requester">{b.requestedBy}</td>
                            <td><BookingStatusBadge status={b.status} /></td>
                            <td>
                                <div className="bk-table-actions">
                                    <Link to={`/bookings/${b.id}`} className="bk-btn bk-btn-outline bk-btn-xs">
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
