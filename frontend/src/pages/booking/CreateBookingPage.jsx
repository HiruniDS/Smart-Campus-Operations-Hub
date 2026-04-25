import { Link } from 'react-router-dom';
import BookingForm from '../../components/booking/BookingForm';
import { BkCard } from '../../components/booking/BkUI';

export default function CreateBookingPage() {
    return (
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <Link to="/bookings" className="text-blue-500 hover:underline">Dashboard</Link>
                        <span className="text-slate-300">›</span>
                        <span>New Booking</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Create Booking Request</h1>
                    <p className="text-slate-500 text-sm">
                        Fill in the details below to request a campus resource. Your request will be reviewed by an administrator.
                    </p>
                </div>
            </div>

            <BkCard className="p-6" style={{ maxWidth: 780 }}>
                <BookingForm />
            </BkCard>
        </div>
    );
}
