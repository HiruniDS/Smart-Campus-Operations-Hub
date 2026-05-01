import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { addFacility, getFacilities, type Facility } from '@/lib/mergedStore';

const typeOptions: Facility['type'][] = ['LAB', 'LECTURE_HALL', 'SEMINAR_ROOM', 'SPORTS_FACILITY', 'STUDY_ROOM', 'MEETING_ROOM', 'OTHER'];

export default function FacilitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>(() => getFacilities());
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | Facility['type']>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Facility['status']>('ALL');
  const [form, setForm] = useState<Omit<Facility, 'id'>>({
    name: '',
    type: 'LAB',
    location: '',
    capacity: 20,
    status: 'ACTIVE',
    description: '',
  });

  const isAdmin = user?.role === 'ADMIN';

  const filtered = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesQuery = `${facility.name} ${facility.location} ${facility.description}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesType = typeFilter === 'ALL' || facility.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || facility.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [facilities, query, typeFilter, statusFilter]);

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const nextFacilities = addFacility(form);
    setFacilities(nextFacilities);
    setForm({ name: '', type: 'LAB', location: '', capacity: 20, status: 'ACTIVE', description: '' });
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            <Building2 className="h-3.5 w-3.5" />
            Facilities catalogue
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Resource management</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
            Browse merged campus resources, inspect availability, and send users toward the booking workflow.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Total</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{facilities.length}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">Active</p>
            <p className="mt-1 text-2xl font-black text-emerald-700">{facilities.filter((facility) => facility.status === 'ACTIVE').length}</p>
          </div>
          <div className="rounded-2xl bg-rose-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-rose-600">Out of service</p>
            <p className="mt-1 text-2xl font-black text-rose-700">{facilities.filter((facility) => facility.status !== 'ACTIVE').length}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">All types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 outline-none"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of service</option>
              </select>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm font-medium outline-none transition focus:border-blue-300 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((facility) => (
              <article key={facility.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      {facility.type.replaceAll('_', ' ')}
                    </div>
                    <h3 className="mt-3 text-xl font-black tracking-tight text-slate-950">{facility.name}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${facility.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {facility.status === 'ACTIVE' ? 'Active' : 'Out of service'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm font-medium text-slate-600">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {facility.location}</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /> Capacity {facility.capacity}</p>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-500">{facility.description}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/bookings')}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  >
                    Book this space
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setFacilities((current) => current.map((item) => item.id === facility.id ? { ...item, status: item.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE' } : item))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Toggle status
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm font-medium text-slate-500">
              No facilities match the current filters.
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Add resource</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Create facility</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
              Keep the facility catalogue aligned with the merged booking workflow.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Name</label>
              <input
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Type</label>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as Facility['type'] }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Location</label>
                <input
                  required
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Capacity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" />
              Save facility
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}