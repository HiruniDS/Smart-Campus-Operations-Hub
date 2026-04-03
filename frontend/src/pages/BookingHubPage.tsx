import { useMemo, useState } from 'react';
import { CalendarDays, Plus, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  addBooking,
  bookingsConflict,
  getBookings,
  getFacilities,
  updateBookingStatus,
  type Booking,
  type BookingStatus,
} from '@/lib/mergedStore';

export default function BookingHubPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>(() => getBookings());
  const [facilities] = useState(() => getFacilities());
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    facilityId: facilities[0]?.id ?? '',
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '11:00',
    purpose: '',
  });

  const isAdmin = user?.role === 'ADMIN';

  const facilityOptions = facilities.filter((facility) => facility.status === 'ACTIVE');

  const stats = useMemo(() => {
    const mine = bookings.filter((booking) => booking.requester === user?.name);
    return {
      total: bookings.length,
      mine: mine.length,
      pending: bookings.filter((booking) => booking.status === 'PENDING').length,
      approved: bookings.filter((booking) => booking.status === 'APPROVED').length,
    };
  }, [bookings, user?.name]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const facility = facilities.find((item) => item.id === form.facilityId);
    if (!facility) {
      setError('Select a valid facility first.');
      return;
    }

    const candidate = {
      facilityId: facility.id,
      facilityName: facility.name,
      requester: user?.name ?? 'Guest',
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      status: (isAdmin ? 'APPROVED' : 'PENDING') as BookingStatus,
    };

    if (bookingsConflict(bookings, candidate)) {
      setError('This time slot overlaps with an existing booking. Choose another slot.');
      return;
    }

    const next = addBooking(candidate);
    setBookings(next);
    setForm((current) => ({ ...current, purpose: '' }));
  };

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
              <CalendarDays className="h-3.5 w-3.5" />
              Booking workflow
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Book a campus resource</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              The merged workflow keeps conflict checking, requests, and approvals together.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{stats.total}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">My requests</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{stats.mine}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">Pending</p>
              <p className="mt-1 text-2xl font-black text-amber-700">{stats.pending}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">Approved</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{stats.approved}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">New request</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Create booking</h2>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Facility</label>
            <select
              value={form.facilityId}
              onChange={(event) => setForm((current) => ({ ...current, facilityId: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
            >
              {facilityOptions.map((facility) => (
                <option key={facility.id} value={facility.id}>{facility.name}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Purpose</label>
              <input
                value={form.purpose}
                onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))}
                placeholder="Workshop, exam, meeting..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Start time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">End time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Submit booking
          </button>
        </form>

        <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Live queue</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Recent bookings</h2>
          </div>

          <div className="space-y-3">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{booking.facilityName}</p>
                    <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">{booking.purpose}</h3>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                      {booking.date} · {booking.startTime} - {booking.endTime} · requested by {booking.requester}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${booking.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {isAdmin && booking.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setBookings(updateBookingStatus(booking.id, 'APPROVED'))}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookings(updateBookingStatus(booking.id, 'REJECTED'))}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </>
                  )}
                  {!isAdmin && booking.requester === user?.name && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      My request
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}