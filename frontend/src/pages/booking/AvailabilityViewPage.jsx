import { useState } from 'react';
import { Link } from 'react-router-dom';
import AvailabilityPanel from '../../components/booking/AvailabilityPanel';

export default function AvailabilityViewPage() {
    const [resourceId, setResourceId] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [query, setQuery] = useState({ resourceId: '', bookingDate: '' });

    const handleCheck = (e) => {
        e.preventDefault();
        setQuery({ resourceId, bookingDate });
    };

    return (
        <div className="bk-page">
            <div className="bk-page-header">
                <div>
                    <div className="bk-breadcrumb">
                        <Link to="/bookings" className="bk-breadcrumb-link">Dashboard</Link>
                        <span className="bk-breadcrumb-sep">›</span>
                        <span>Availability</span>
                    </div>
                    <h1 className="bk-page-title">Check Availability</h1>
                    <p className="bk-page-subtitle">
                        View occupied time slots for any campus resource on a specific date before making a booking.
                    </p>
                </div>
            </div>

            <div className="bk-card" style={{ maxWidth: 560 }}>
                <h3 className="bk-card-title">Resource Availability Query</h3>
                <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="bk-field">
                        <label className="bk-label">Resource ID</label>
                        <input
                            className="bk-input"
                            value={resourceId}
                            onChange={(e) => setResourceId(e.target.value)}
                            placeholder="e.g. HALL-A1"
                            required
                        />
                    </div>
                    <div className="bk-field">
                        <label className="bk-label">Date</label>
                        <input
                            type="date"
                            className="bk-input"
                            value={bookingDate}
                            onChange={(e) => setBookingDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="bk-btn bk-btn-primary" style={{ alignSelf: 'flex-start' }}>
                        Check Availability
                    </button>
                </form>
            </div>

            {(query.resourceId || query.bookingDate) && (
                <div className="bk-card" style={{ maxWidth: 560 }}>
                    <AvailabilityPanel resourceId={query.resourceId} bookingDate={query.bookingDate} />
                </div>
            )}

            {query.resourceId && (
                <div style={{ marginTop: '1rem' }}>
                    <Link to="/bookings/new" className="bk-btn bk-btn-primary">
                        Create a Booking for this Resource →
                    </Link>
                </div>
            )}
        </div>
    );
}
