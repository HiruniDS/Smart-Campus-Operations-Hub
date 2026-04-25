import { useState, useEffect, useCallback } from 'react';
import { checkAvailability } from '../../api/bookingApi';
import { LoadingState, ErrorState } from './BookingStates';

const SLOT_CLS = {
    PENDING: 'bg-amber-50 border-amber-300',
    APPROVED: 'bg-emerald-50 border-emerald-300',
};

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
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center mt-3">
                <span className="text-slate-400 text-sm">Enter a Resource ID and date to check availability.</span>
            </div>
        );
    }

    if (loading) return <LoadingState message="Checking availability…" />;
    if (error) return <ErrorState message={error} onRetry={load} />;
    if (!data) return null;

    const slots = data.occupiedSlots ?? [];

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-3">
            <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 font-mono text-sm">{data.resourceId}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${data.available
                        ? 'text-emerald-700 bg-emerald-50 ring-1 ring-emerald-300'
                        : 'text-amber-700 bg-amber-50 ring-1 ring-amber-300'
                    }`}>
                    {data.available ? '● Available' : '● Has Bookings'}
                </span>
            </div>
            <p className="text-sm text-slate-500 mb-3">{data.summary}</p>

            {slots.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Occupied Slots</p>
                    <div className="flex flex-col gap-2">
                        {slots.map((slot, i) => (
                            <div
                                key={i}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg border ${SLOT_CLS[slot.status] ?? 'bg-slate-100 border-slate-300'
                                    }`}
                            >
                                <span className="font-mono text-sm text-slate-800 font-semibold">
                                    {slot.startTime} – {slot.endTime}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {slot.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {slots.length === 0 && (
                <p className="text-sm text-emerald-700 m-0">✓ All time slots are available for this date.</p>
            )}
        </div>
    );
}
