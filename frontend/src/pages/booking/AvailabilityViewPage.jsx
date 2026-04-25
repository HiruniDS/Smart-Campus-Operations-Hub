import { useState } from 'react';
import { Link } from 'react-router-dom';
import AvailabilityPanel from '../../components/booking/AvailabilityPanel';
import { BkCard, BkLabel, inputCls, btnCls } from '../../components/booking/BkUI';

export default function AvailabilityViewPage() {
    const [resourceId, setResourceId] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [query, setQuery] = useState({ resourceId: '', bookingDate: '' });

    const handleCheck = (e) => {
        e.preventDefault();
        setQuery({ resourceId, bookingDate });
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Link to="/bookings" className="text-blue-500 hover:underline">Dashboard</Link>
                        <span className="text-slate-300">›</span>
                        <span>Availability</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Check Availability</h1>
                    <p className="text-slate-500 text-sm">
                        View occupied time slots for any campus resource on a specific date before making a booking.
                    </p>
                </div>
            </div>

            <BkCard className="p-6" style={{ maxWidth: 560 }}>
                <h3 className="text-base font-semibold text-slate-800 mb-4">Resource Availability Query</h3>
                <form onSubmit={handleCheck} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <BkLabel>Resource ID</BkLabel>
                        <input
                            className={inputCls(false)}
                            value={resourceId}
                            onChange={(e) => setResourceId(e.target.value)}
                            placeholder="e.g. HALL-A1"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <BkLabel>Date</BkLabel>
                        <input
                            type="date"
                            className={inputCls(false)}
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={`${btnCls('primary')} self-start`}>
                        Check Availability
                    </button>
                </form>
            </BkCard>

            {(query.resourceId || query.bookingDate) && (
                <BkCard className="p-6" style={{ maxWidth: 560 }}>
                    <AvailabilityPanel resourceId={query.resourceId} bookingDate={query.bookingDate} />
                </BkCard>
            )}

            {query.resourceId && (
                <div>
                    <Link to="/bookings/new" className={btnCls('primary')}>
                        Create a Booking for this Resource →
                    </Link>
                </div>
            )}
        </div>
    );
}
