import { useMemo, useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Clock3,
  Edit,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Waves,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import {
  fetchAllFacilities,
  fetchActiveFacilities,
  createFacility as createFacilityApi,
  updateFacility as updateFacilityApi,
  deleteFacility as deleteFacilityApi,
} from '../api/facilityApi';

// Local Facility type matching backend response
export type Facility = {
  id: string;
  name: string;
  type: 'LAB' | 'LECTURE_HALL' | 'SEMINAR_ROOM' | 'SPORTS_FACILITY' | 'STUDY_ROOM' | 'MEETING_ROOM' | 'OTHER';
  location: string;
  capacity: number;
  status: 'ACTIVE' | 'OUT_OF_SERVICE';
  description: string;
  image?: string;
};
import { GradientDots } from '@/components/ui/gradient-dots';

const typeOptions: Facility['type'][] = ['LAB', 'LECTURE_HALL', 'SEMINAR_ROOM', 'SPORTS_FACILITY', 'STUDY_ROOM', 'MEETING_ROOM', 'OTHER'];

const typeAccent: Record<Facility['type'], string> = {
  LAB: 'bg-cyan-100 text-cyan-800',
  LECTURE_HALL: 'bg-blue-100 text-blue-800',
  SEMINAR_ROOM: 'bg-orange-100 text-orange-800',
  SPORTS_FACILITY: 'bg-amber-100 text-amber-800',
  STUDY_ROOM: 'bg-emerald-100 text-emerald-800',
  MEETING_ROOM: 'bg-rose-100 text-rose-800',
  OTHER: 'bg-slate-200 text-slate-700',
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

function prettyType(type: Facility['type']) {
  return type.replaceAll('_', ' ');
}

export default function FacilitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
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
    image: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const formPanelRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isRegularUser = user?.role === 'USER';
  const canManage = isAdmin || isTechnician;

  // Load facilities from backend
  useEffect(() => {
    const load = async () => {
      setLoadingFacilities(true);
      try {
        const data = isRegularUser ? await fetchActiveFacilities() : await fetchAllFacilities();
        setFacilities(data);
      } catch (err) {
        console.error('Failed to load facilities', err);
      } finally {
        setLoadingFacilities(false);
      }
    };
    load();
  }, [isRegularUser]);

  const bookings = useMemo(() => [], []);
  const tickets = useMemo(() => [], []);
  // Backend already filters by status for USER role; show all for others
  const displayFacilities = facilities;

  const filtered = useMemo(() => {
    return displayFacilities.filter((facility) => {
      const haystack = `${facility.name} ${facility.location} ${facility.description}`.toLowerCase();
      const matchesQuery = haystack.includes(query.toLowerCase());
      const matchesType = typeFilter === 'ALL' || facility.type === typeFilter;
      const matchesStatus = statusFilter === 'ALL' || facility.status === statusFilter;
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [displayFacilities, query, typeFilter, statusFilter]);

  const analytics = useMemo(() => {
    const facilityMetrics = facilities.map((facility) => {
      const facilityBookings = bookings.filter((booking) => booking.facilityId === facility.id);
      const activeTickets = tickets.filter((ticket) => {
        const text = `${ticket.title} ${ticket.description}`.toLowerCase();
        return text.includes(facility.name.toLowerCase()) && !['RESOLVED', 'CLOSED'].includes(ticket.status);
      });

      const utilization = Math.min(100, Math.round(facilityBookings.length * 16 + Math.min(facility.capacity, 120) / 4));
      const riskScore = activeTickets.length * 30 + (facility.status === 'OUT_OF_SERVICE' ? 35 : 0);

      return {
        facility,
        bookings: facilityBookings.length,
        activeTickets: activeTickets.length,
        utilization,
        riskScore,
      };
    });

    const busiest = [...facilityMetrics].sort((a, b) => b.bookings - a.bookings || b.utilization - a.utilization)[0];
    const riskiest = [...facilityMetrics].sort((a, b) => b.riskScore - a.riskScore)[0];
    const utilizationRows = [...facilityMetrics].sort((a, b) => b.utilization - a.utilization).slice(0, 4);

    const bookingWindows = bookings.reduce<Record<string, number>>((acc, booking) => {
      const hour = Number(booking.startTime.split(':')[0]);
      const label = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const peakWindow = Object.entries(bookingWindows).sort((a, b) => b[1] - a[1])[0];
    const activeCount = facilities.filter((facility) => facility.status === 'ACTIVE').length;

    return {
      busiest,
      riskiest,
      utilizationRows,
      peakWindow,
      total: facilities.length,
      active: activeCount,
      inactive: facilities.length - activeCount,
      coverage: facilities.length ? Math.round((activeCount / facilities.length) * 100) : 0,
      avgCapacity: facilities.length ? Math.round(facilities.reduce((sum, facility) => sum + facility.capacity, 0) / facilities.length) : 0,
    };
  }, [facilities, bookings, tickets]);

  const blankForm = { name: '', type: 'LAB' as Facility['type'], location: '', capacity: 20, status: 'ACTIVE' as Facility['status'], description: '', image: '' };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        const updated = await updateFacilityApi(editingId, form);
        setFacilities((prev) => prev.map((f) => f.id === editingId ? updated : f));
        setEditingId(null);
      } else {
        const created = await createFacilityApi({ ...form, createdBy: user?.email ?? '' });
        setFacilities((prev) => [...prev, created]);
      }
      setForm(blankForm);
    } catch (err) {
      console.error('Failed to save facility', err);
    }
  };

  const handleEditFacility = (facility: Facility) => {
    setForm({
      name: facility.name,
      type: facility.type,
      location: facility.location,
      capacity: facility.capacity,
      status: facility.status,
      description: facility.description,
      image: facility.image || '',
    });
    setEditingId(facility.id);
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteFacility = async (id: string) => {
    try {
      await deleteFacilityApi(id);
      setFacilities((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Failed to delete facility', err);
    }
    setShowDeleteConfirm(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(blankForm);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const imageData = loadEvent.target?.result as string;
      setForm((current) => ({ ...current, image: imageData }));
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setForm((current) => ({ ...current, image: '' }));
  };

  const toggleFacilityStatus = async (facilityId: string) => {
    const facility = facilities.find((f) => f.id === facilityId);
    if (!facility) return;
    const newStatus = facility.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      const updated = await updateFacilityApi(facilityId, { status: newStatus });
      setFacilities((prev) => prev.map((f) => f.id === facilityId ? updated : f));
    } catch (err) {
      console.error('Failed to toggle facility status', err);
    }
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      {isRegularUser ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50/50 p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                <Building2 className="h-3.5 w-3.5" />
                Available resources
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Find a space and book it fast.
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Browse active campus facilities, compare capacity and location, then move straight into the booking flow.
              </p>
            </div>

            <div className="flex shrink-0 flex-row gap-3">
              <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Available</p>
                <p className="mt-1.5 text-3xl font-black text-slate-950">{analytics.active}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Peak time</p>
                <p className="mt-1.5 text-3xl font-black text-emerald-950">{analytics.peakWindow?.[0] ?? 'Open'}</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700">Avg seats</p>
                <p className="mt-1.5 text-3xl font-black text-sky-950">{analytics.avgCapacity}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative w-full overflow-hidden rounded-[2.25rem] border border-slate-200 bg-[linear-gradient(135deg,#f3f8ec_0%,#fffdf7_33%,#eef6ff_100%)] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.28)]"
        >
          <div className="absolute inset-0">
            <GradientDots
              duration={20}
              colorCycleDuration={10}
              dotSize={8}
              spacing={22}
              backgroundColor="rgba(255,255,255,0.24)"
              className="pointer-events-none opacity-60 mix-blend-soft-light [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]"
            />
            <motion.div
              animate={{ x: [0, 16, 0], y: [0, -10, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-[-4rem] top-[-3rem] h-48 w-48 rounded-full bg-emerald-200/45 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -18, 0], y: [0, 16, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute right-[-2rem] top-[2rem] h-56 w-56 rounded-full bg-sky-200/40 blur-3xl"
            />
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-[-4rem] left-[30%] h-56 w-56 rounded-full bg-amber-100/60 blur-3xl"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.72),rgba(255,255,255,0.18))]" />
          </div>

          <div className="relative grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr] xl:p-10">
            <div className="space-y-6">
              <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-700 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Resource Experience Layer
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.55 }} className="space-y-4">
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl xl:text-6xl">
                  A premium facilities cockpit for smarter campus operations.
                </h1>
                <p className="max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                  Manage facilities through a polished control surface that blends analytics, demand signals, and resource actions into one high-clarity workspace.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Add new facility
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/bookings')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Open booking flow
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/75 px-4 py-3 text-sm font-semibold text-slate-700 backdrop-blur">
                  <Waves className="h-4 w-4 text-emerald-600" />
                  Live coverage: {analytics.coverage}%
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                transition={{ duration: 0.65 }}
                className="grid gap-3 rounded-[1.8rem] border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur sm:grid-cols-3"
              >
                <div className="rounded-2xl bg-slate-950 px-4 py-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Fastest signal</p>
                  <p className="mt-2 truncate text-lg font-black">{analytics.busiest?.facility.name ?? 'No demand yet'}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">Most requested resource</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Support watch</p>
                  <p className="mt-2 truncate text-lg font-black text-slate-950">{analytics.riskiest?.facility.name ?? 'Stable'}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Highest current maintenance pressure</p>
                </div>
                <div className="rounded-2xl bg-emerald-50/90 px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">Booking pulse</p>
                  <p className="mt-2 text-lg font-black text-emerald-950">{analytics.peakWindow?.[0] ?? 'Open window'}</p>
                  <p className="mt-1 text-xs font-semibold text-emerald-800/70">Busiest reservation start period</p>
                </div>
              </motion.div>

              <motion.div variants={stagger} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Portfolio', value: analytics.total, tone: 'bg-white/88 border-white/80 text-slate-950', meta: 'Resources indexed' },
                  { label: 'Coverage', value: `${analytics.coverage}%`, tone: 'bg-emerald-50/90 border-emerald-100 text-emerald-900', meta: 'Ready for use' },
                  { label: 'Peak Window', value: analytics.peakWindow?.[0] ?? 'Open', tone: 'bg-slate-950 border-slate-900 text-white', meta: analytics.peakWindow ? `${analytics.peakWindow[1]} starts` : 'No trend yet' },
                  { label: 'Avg Capacity', value: analytics.avgCapacity, tone: 'bg-amber-50/90 border-amber-100 text-amber-950', meta: 'Seats per space' },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    variants={fadeUp}
                    transition={{ duration: 0.45 }}
                    className={`rounded-3xl border p-4 shadow-sm ${item.tone}`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">{item.label}</p>
                    <p className="mt-2 text-3xl font-black">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold opacity-75">{item.meta}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <motion.div variants={fadeUp} transition={{ duration: 0.55 }} className="rounded-[1.9rem] border border-white/70 bg-white/85 p-5 shadow-lg shadow-slate-200/50 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Demand Leader</p>
                    <h2 className="mt-1 text-lg font-black tracking-tight text-slate-950">{analytics.busiest?.facility.name ?? 'No demand yet'}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-600">
                  {analytics.busiest
                    ? `${analytics.busiest.bookings} bookings keep this facility at the front of current demand.`
                    : 'Booking behavior will appear here once requests start building up.'}
                </p>
              </motion.div>

              <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="rounded-[1.9rem] border border-white/70 bg-slate-950 p-5 text-white shadow-lg shadow-slate-300/40">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/10 p-3 text-amber-300">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Maintenance Watch</p>
                    <h2 className="mt-1 text-lg font-black tracking-tight">{analytics.riskiest?.facility.name ?? 'No active risk'}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm font-medium leading-6 text-slate-300">
                  {analytics.riskiest
                    ? `${analytics.riskiest.activeTickets} active issue${analytics.riskiest.activeTickets === 1 ? '' : 's'} currently push this resource into the highest risk band.`
                    : 'No active support signals are being pulled from unresolved facility tickets.'}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ── Filter toolbar — always full-width ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, location, or description…"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as typeof typeFilter)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
            >
              <option value="ALL">All types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{prettyType(type)}</option>
              ))}
            </select>
            {canManage && (
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="OUT_OF_SERVICE">Out of service</option>
              </select>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{filtered.length} shown</span>
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">{analytics.active} active</span>
            <span className="rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700">{analytics.inactive} offline</span>
          </div>
        </div>
      </motion.div>

      {/* ── Main content area ───────────────────────────────────────── */}
      <div className={`w-full min-w-0 items-start${canManage ? ' grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]' : ''}`}>
        {/* LEFT: facility cards */}
        <div className="w-full min-w-0">

          {loadingFacilities ? (
            /* ── Loading skeleton ── */
            <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2${canManage ? ' xl:grid-cols-2' : ' xl:grid-cols-3 2xl:grid-cols-4'}`}>
              {Array.from({ length: canManage ? 4 : 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="h-48 w-full animate-pulse bg-slate-100" />
                  <div className="space-y-3 p-5">
                    <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-5 w-2/3 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                      <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                    </div>
                    <div className="mt-3 h-11 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            /* ── Empty state ── */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-xl font-black tracking-tight text-slate-950">No resources match this view</h3>
              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                Try widening the search, switching the status filter, or picking a different facility type.
              </p>
            </motion.div>
          ) : (
            /* ── Facility cards grid ── */
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className={`grid gap-5 grid-cols-1 sm:grid-cols-2${canManage ? ' xl:grid-cols-2' : ' xl:grid-cols-3 2xl:grid-cols-4'}`}
            >
              {filtered.map((facility) => {
                const facilityBookings = bookings.filter((booking) => booking.facilityId === facility.id).length;
                const utilization = Math.min(100, Math.round(facilityBookings * 16 + Math.min(facility.capacity, 120) / 4));
                return (
                  <motion.article
                    key={facility.id}
                    variants={fadeUp}
                    transition={{ duration: 0.4 }}
                    className={`group flex h-full flex-col overflow-hidden rounded-3xl border bg-white transition duration-300 hover:-translate-y-1 ${isRegularUser
                      ? 'border-slate-200 shadow-[0_18px_45px_-26px_rgba(15,23,42,0.22)] hover:shadow-[0_28px_55px_-24px_rgba(15,23,42,0.18)]'
                      : 'border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/70'
                      }`}
                  >
                    <div className="relative shrink-0 overflow-hidden">
                      {facility.image ? (
                        <img src={facility.image} alt={facility.name} className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                          <Building2 className="h-10 w-10" />
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${typeAccent[facility.type]}`}>
                          {prettyType(facility.type)}
                        </span>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${facility.status === 'ACTIVE' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {facility.status === 'ACTIVE' ? 'Live' : 'Paused'}
                        </span>
                      </div>

                      <div className={`absolute inset-x-4 bottom-4 rounded-2xl p-3 text-white backdrop-blur ${isRegularUser ? 'bg-white/18 ring-1 ring-white/25' : 'bg-slate-950/85'
                        }`}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${isRegularUser ? 'text-white/80' : 'text-slate-300'}`}>Utilization</p>
                            <p className="mt-1 text-xl font-black">{utilization}%</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${isRegularUser ? 'text-white/80' : 'text-slate-300'}`}>Bookings</p>
                            <p className="mt-1 text-xl font-black">{facilityBookings}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`flex flex-1 flex-col gap-4 p-5 ${isRegularUser ? 'bg-gradient-to-b from-white to-slate-50/60' : ''}`}>
                      <div className="min-w-0 flex-1 space-y-1.5">
                        {isRegularUser && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                              Ready to book
                            </span>
                          </div>
                        )}
                        <h3 className="line-clamp-1 text-xl font-black tracking-tight text-slate-950">{facility.name}</h3>
                        <p className="line-clamp-2 text-sm leading-6 text-slate-500">{facility.description}</p>
                      </div>

                      <div className={`grid gap-3 grid-cols-2`}>
                        <div className={`rounded-2xl p-3 ${isRegularUser ? 'border border-slate-100 bg-white shadow-sm' : 'bg-slate-50'}`}>
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            <MapPin className="h-3 w-3" />
                            Location
                          </p>
                          <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-slate-700">{facility.location}</p>
                        </div>
                        <div className={`rounded-2xl p-3 ${isRegularUser ? 'border border-slate-100 bg-white shadow-sm' : 'bg-slate-50'}`}>
                          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            <Users className="h-3 w-3" />
                            Capacity
                          </p>
                          <p className="mt-1.5 text-xs font-semibold text-slate-700">{facility.capacity} seats</p>
                        </div>
                      </div>

                      {!isRegularUser && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            <span>Readiness</span>
                            <span>{facility.status === 'ACTIVE' ? 'Available for bookings' : 'Maintenance blocked'}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${facility.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${facility.status === 'ACTIVE' ? Math.max(utilization, 30) : 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-wrap gap-3 mt-auto ${isRegularUser ? 'items-center rounded-2xl border border-slate-100 bg-white p-3 shadow-sm' : ''}`}>
                        <button
                          type="button"
                          onClick={() => {
                            const params = new URLSearchParams({
                              facilityId: facility.id,
                              facilityName: facility.name,
                              resourceType: facility.type,
                              location: facility.location,
                            });
                            navigate(`/bookings/new?${params.toString()}`);
                          }}
                          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${isRegularUser
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-slate-950 text-white hover:bg-slate-800'
                            }`}
                        >
                          <Clock3 className="h-4 w-4" />
                          {isRegularUser ? 'Book this facility' : 'Book resource'}
                        </button>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleEditFacility(facility)}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                      </div>

                      {canManage && (
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => toggleFacilityStatus(facility.id)}
                              className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700 transition hover:bg-amber-100"
                            >
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Toggle status
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(facility.id)}
                            className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-700 transition hover:bg-rose-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}

                      {showDeleteConfirm === facility.id && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                          <p className="text-sm font-semibold text-rose-900">Delete this facility from the catalogue?</p>
                          <p className="mt-1 text-sm text-rose-700">This removes it from the current local resource list.</p>
                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteFacility(facility.id)}
                              className="flex-1 rounded-xl bg-rose-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
                            >
                              Confirm delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(null)}
                              className="flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          )}
        </div>

        {canManage && (
          <motion.div ref={formPanelRef} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.2 }} className="space-y-6 xl:sticky xl:top-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Facilities Intelligence</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">Resource pulse</h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-300">
                    A compact operating view of demand, pressure, and maintenance risk.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 text-emerald-300">
                  <Wrench className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Top pressure</p>
                  <p className="mt-2 text-lg font-black">{analytics.busiest?.facility.name ?? 'No data yet'}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {analytics.busiest ? `${analytics.busiest.bookings} bookings currently make this the most requested space.` : 'Create more bookings to reveal the busiest asset.'}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Support risk</p>
                  <p className="mt-2 text-lg font-black">{analytics.riskiest?.facility.name ?? 'No active risk'}</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {analytics.riskiest ? `${analytics.riskiest.activeTickets} open issue${analytics.riskiest.activeTickets === 1 ? '' : 's'} linked to this resource.` : 'Open facility issues will surface here automatically.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Utilization ranking</p>
                    <p className="mt-1 text-sm font-semibold text-slate-200">Highest pressure resources</p>
                  </div>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>

                <div className="mt-4 space-y-3">
                  {analytics.utilizationRows.map((row) => (
                    <div key={row.facility.id} className="rounded-2xl bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-white">{row.facility.name}</p>
                          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                            {prettyType(row.facility.type)} - {row.bookings} booking{row.bookings === 1 ? '' : 's'}
                          </p>
                        </div>
                        <p className="text-sm font-black text-emerald-300">{row.utilization}%</p>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${row.utilization}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    {editingId ? 'Edit resource' : 'Add resource'}
                  </p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                    {editingId ? 'Update facility' : 'Create facility'}
                  </h2>
                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    {editingId
                      ? 'Refine the catalogue entry and push the updated operating details live.'
                      : 'Add a new campus resource with the details users need to discover and book it.'}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                  <Plus className="h-5 w-5" />
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleCreate}>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Type</label>
                  <select
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as Facility['type'] }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                  >
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>{prettyType(type)}</option>
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Facility image</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="facility-image-input"
                    />
                    <label
                      htmlFor="facility-image-input"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-white"
                    >
                      <Upload className="h-5 w-5" />
                      Select cover image
                    </label>
                  </div>

                  {form.image && (
                    <div className="relative mt-3 overflow-hidden rounded-2xl border border-slate-200">
                      <img src={form.image} alt="Preview" className="h-36 w-full object-cover" />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute right-3 top-3 rounded-full bg-rose-500 p-1.5 text-white transition hover:bg-rose-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500"
                  >
                    {editingId ? 'Update facility' : 'Save facility'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}