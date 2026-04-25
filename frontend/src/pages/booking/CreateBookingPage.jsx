import { Link } from 'react-router-dom';
import BookingForm from '../../components/booking/BookingForm';
import { BkCard } from '../../components/booking/BkUI';
import createIllustration from '../../assets/booking/booking-create-side-illustration.png';

export default function CreateBookingPage() {
  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* ── Breadcrumbs ──────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          to="/bookings"
          className="text-blue-500 hover:text-blue-700 transition-colors font-medium"
        >
          Dashboard
        </Link>
        <span className="text-slate-300">›</span>
        <span className="text-slate-500 font-medium">New Booking</span>
      </nav>

      {/* ── Header ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Create Booking Request
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-xl">
          Fill in the details below to request a campus resource. Your request
          will be reviewed by an administrator.
        </p>
      </div>

      {/* ── Form + Side Illustration ───────────────── */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <BkCard className="max-w-3xl w-full">
          <BookingForm />
        </BkCard>
        <div className="hidden xl:flex shrink-0 flex-col items-center justify-start pt-6">
          <img
            src={createIllustration}
            alt="Submit a campus resource booking request"
            width="320"
            height="373"
            loading="lazy"
            className="rounded-2xl shadow-sm object-contain max-h-[520px]"
          />
        </div>
      </div>
    </div>
  );
}