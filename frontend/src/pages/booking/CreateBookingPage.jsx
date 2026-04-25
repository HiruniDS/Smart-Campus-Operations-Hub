import { Link } from 'react-router-dom';
import BookingForm from '../../components/booking/BookingForm';

export default function CreateBookingPage() {
    return (
        <div className="bk-page">
            <div className="bk-page-header">
                <div>
                    <div className="bk-breadcrumb">
                        <Link to="/bookings" className="bk-breadcrumb-link">Dashboard</Link>
                        <span className="bk-breadcrumb-sep">›</span>
                        <span>New Booking</span>
                    </div>
                    <h1 className="bk-page-title">Create Booking Request</h1>
                    <p className="bk-page-subtitle">
                        Fill in the details below to request a campus resource. Your request will be reviewed by an administrator.
                    </p>
                </div>
            </div>

            <div className="bk-card bk-form-card">
                <BookingForm />
            </div>
        </div>
    );
}
