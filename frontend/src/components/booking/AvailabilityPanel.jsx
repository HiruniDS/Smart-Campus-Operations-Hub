import { useState, useEffect, useCallback } from 'react';
import { checkAvailability } from '../../api/bookingApi';
import { LoadingState, ErrorState } from './BookingStates';

export default function AvailabilityPanel({ resourceId, bookingDate }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        if (!resourceId || !bookingDate) return;
        setLoading(true);
        setError('');
        try {
            const result = await checkAvailability(resourceId, bookingDate);
            setData(result);
        } catch (err) {
            setError(err?.response?.data?.message || 'Could not fetch availability.');
        } finally {
            setLoading(false);
        }
    }, [resourceId, bookingDate]);

    useEffect(() => { load(); }, [load]);

    if (!resourceId || !bookingDate) {
        return (
            <div className="bk-avail-panel bk-avail-empty">
                <span className="bk-avail-hint">Enter a Resource ID and date to check availability.</span>
            </div>
        );
    }

    if (loading) return <LoadingState message="Checking availability…" />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!data) return null;

    return (
        <div className="bk-avail-panel">
            <div className="bk-avail-header">
                <span className="bk-avail-resource">{data.resourceId}</span>
                <span className={`bk-avail-status ${data.available ? 'bk-avail-open' : 'bk-avail-busy'}`}>
                    {data.available ? '● Available' : '● Has Bookings'}
                </span>
            </div>
            <p className="bk-avail-summary">{data.summary}</p>

            {data.occupiedSlots && data.occupiedSlots.length > 0 && (
                <div className="bk-avail-slots">
                    <p className="bk-avail-slots-title">Occupied Slots</p>
                    <div className="bk-slot-list">
                        {data.occupiedSlots.map((slot, i) => (
                            <div key={i} className={`bk-slot bk-slot-${slot.status.toLowerCase()}`}>
                                <span className="bk-slot-time">
                                    {slot.startTime} – {slot.endTime}
                                </span>
                                <span className="bk-slot-tag">{slot.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {(!data.occupiedSlots || data.occupiedSlots.length === 0) && (
                <p className="bk-avail-clear">No occupied slots — this resource is fully free on this date.</p>
            )}
        </div>
    );
}
