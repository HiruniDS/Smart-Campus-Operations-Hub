import { useMemo, useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Building2, Edit, MapPin, Plus, Search,
  ShieldCheck, Trash2, Upload, Users, Wrench, X, Clock3,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchAllFacilities,
  fetchActiveFacilities,
  createFacility as createFacilityApi,
  updateFacility as updateFacilityApi,
  deleteFacility as deleteFacilityApi,
} from '../api/facilityApi';

/* ─── Types ───────────────────────────────────────────────── */
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

const typeOptions: Facility['type'][] = [
  'LAB', 'LECTURE_HALL', 'SEMINAR_ROOM',
  'SPORTS_FACILITY', 'STUDY_ROOM', 'MEETING_ROOM', 'OTHER',
];

const typeAccent: Record<Facility['type'], { bg: string; text: string }> = {
  LAB:             { bg: '#F0FDFA', text: '#0D9488' },
  LECTURE_HALL:    { bg: '#EFF6FF', text: '#2563EB' },
  SEMINAR_ROOM:    { bg: '#F5F3FF', text: '#7C3AED' },
  SPORTS_FACILITY: { bg: '#F0FDF4', text: '#16A34A' },
  STUDY_ROOM:      { bg: '#FFFBEB', text: '#D97706' },
  MEETING_ROOM:    { bg: '#FFF1F2', text: '#E11D48' },
  OTHER:           { bg: '#F8FAFC', text: '#64748B' },
};

const prettyType = (type: Facility['type']) => type.replaceAll('_', ' ');

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .fp-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes fpFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .fp-u0 { animation: fpFadeUp .35s ease both; }
  .fp-u1 { animation: fpFadeUp .35s .07s ease both; }
  .fp-u2 { animation: fpFadeUp .35s .14s ease both; }
  .fp-u3 { animation: fpFadeUp .35s .21s ease both; }

  .fp-input {
    width: 100%; box-sizing: border-box;
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid #E5E7EB; background: #FAFAF8;
    font-size: 14px; color: #111827; outline: none;
    font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
  }
  .fp-input::placeholder { color: #C0BBB0; }
  .fp-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    background: #fff;
  }
  .fp-select { appearance: none; cursor: pointer; padding-right: 36px; }

  .fp-card {
    background: #fff; border: 1px solid rgba(0,0,0,0.07);
    border-radius: 18px; overflow: hidden;
    transition: transform .2s ease, box-shadow .2s ease;
    display: flex; flex-direction: column;
  }
  .fp-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.09);
  }

  .fp-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 18px; border-radius: 11px; cursor: pointer; border: none;
    font-size: 13px; font-weight: 700; color: #fff; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 3px 10px rgba(16,185,129,0.28);
    transition: filter .15s, transform .15s;
    width: 100%;
  }
  .fp-btn-primary:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  .fp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .fp-btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 18px; border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #fff; color: #374151;
    border: 1.5px solid #E5E7EB;
    transition: background .15s, border-color .15s, color .15s;
  }
  .fp-btn-secondary:hover {
    background: #F0FDF4; border-color: #A7F3D0; color: #059669;
  }

  .fp-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 13px; border-radius: 9px; cursor: pointer;
    font-size: 11px; font-weight: 700; font-family: inherit;
    background: #FFF1F2; color: #E11D48;
    border: 1.5px solid #FECDD3;
    transition: background .15s;
  }
  .fp-btn-danger:hover { background: #FFE4E6; }

  .fp-btn-warn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 13px; border-radius: 9px; cursor: pointer;
    font-size: 11px; font-weight: 700; font-family: inherit;
    background: #FFFBEB; color: #D97706;
    border: 1.5px solid #FDE68A;
    transition: background .15s;
  }
  .fp-btn-warn:hover { background: #FEF3C7; }

  .fp-stat-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 99px;
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.16em;
  }

  .fp-skeleton { background: #F0EDE6; border-radius: 8px; animation: fpPulse 1.4s ease-in-out infinite; }
  @keyframes fpPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
`;

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function FacilitiesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [facilities,        setFacilities]        = useState<Facility[]>([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [query,             setQuery]             = useState('');
  const [typeFilter,        setTypeFilter]        = useState<'ALL' | Facility['type']>('ALL');
  const [statusFilter,      setStatusFilter]      = useState<'ALL' | Facility['status']>('ALL');
  const [editingId,         setEditingId]         = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const blankForm = {
    name: '', type: 'LAB' as Facility['type'],
    location: '', capacity: 20,
    status: 'ACTIVE' as Facility['status'],
    description: '', image: '',
  };
  const [form, setForm] = useState<Omit<Facility, 'id'>>(blankForm);

  const formPanelRef = useRef<HTMLDivElement>(null);

  const isAdmin       = user?.role === 'ADMIN';
  const isTechnician  = user?.role === 'TECHNICIAN';
  const isRegularUser = user?.role === 'USER';
  const canManage     = isAdmin || isTechnician;

  /* ── Load facilities ── */
  useEffect(() => {
    const load = async () => {
      setLoadingFacilities(true);
      try {
        const data = isRegularUser ? await fetchActiveFacilities() : await fetchAllFacilities();
        setFacilities(data);
      } catch (err) { console.error('Failed to load facilities', err); }
      finally       { setLoadingFacilities(false); }
    };
    load();
  }, [isRegularUser]);

  /* ── Filter ── */
  const filtered = useMemo(() => facilities.filter((f) => {
    const haystack = `${f.name} ${f.location} ${f.description}`.toLowerCase();
    const matchesQuery  = haystack.includes(query.toLowerCase());
    const matchesType   = typeFilter   === 'ALL' || f.type   === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || f.status === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  }), [facilities, query, typeFilter, statusFilter]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const active   = facilities.filter((f) => f.status === 'ACTIVE').length;
    const inactive = facilities.length - active;
    const avgCapacity = facilities.length
      ? Math.round(facilities.reduce((s, f) => s + f.capacity, 0) / facilities.length)
      : 0;
    return {
      total: facilities.length, active, inactive, avgCapacity,
      coverage: facilities.length ? Math.round((active / facilities.length) * 100) : 0,
    };
  }, [facilities]);

  /* ── Handlers ── */
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
    } catch (err) { console.error('Failed to save facility', err); }
  };

  const handleEditFacility = (f: Facility) => {
    setForm({
      name: f.name, type: f.type, location: f.location,
      capacity: f.capacity, status: f.status,
      description: f.description, image: f.image || '',
    });
    setEditingId(f.id);
    formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteFacility = async (id: string) => {
    try {
      await deleteFacilityApi(id);
      setFacilities((prev) => prev.filter((f) => f.id !== id));
    } catch (err) { console.error('Failed to delete facility', err); }
    setShowDeleteConfirm(null);
  };

  const handleCancelEdit = () => { setEditingId(null); setForm(blankForm); };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setForm((c) => ({ ...c, image: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const clearImage = () => setForm((c) => ({ ...c, image: '' }));

  const toggleFacilityStatus = async (id: string) => {
    const f = facilities.find((x) => x.id === id);
    if (!f) return;
    const newStatus = f.status === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      const updated = await updateFacilityApi(id, { status: newStatus });
      setFacilities((prev) => prev.map((x) => x.id === id ? updated : x));
    } catch (err) { console.error('Failed to toggle facility status', err); }
  };

  const handleBookFacility = (f: Facility) => {
    const params = new URLSearchParams({
      facilityId: f.id, facilityName: f.name,
      resourceType: f.type, location: f.location,
    });
    navigate(`/bookings/new?${params.toString()}`);
  };

  return (
    <div className="fp-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="fp-u0 flex items-center gap-1.5 text-xs mb-6">
          <span style={{ color: '#9CA3AF' }} className="font-semibold uppercase tracking-widest">Operations</span>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">Facilities</span>
        </nav>

        {/* ── HERO ───────────────────────────────────── */}
        <div className="fp-u0 relative overflow-hidden rounded-2xl mb-6"
          style={{ background: '#0C1D11' }}>

          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }} />
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)' }} />
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />
          <div className="absolute bottom-0 right-48 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06), transparent 70%)' }} />

          <div className="relative px-8 py-9 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isRegularUser ? 'Available Resources' : canManage ? 'Operations Console' : 'Resources'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2"
                style={{ color: '#F0FDF4' }}>
                {isRegularUser ? 'Find a space and book it fast.' : 'Campus facilities catalogue.'}
              </h1>
              <p className="text-sm" style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                {isRegularUser
                  ? 'Browse active campus facilities, compare capacity and location, then move straight into the booking flow.'
                  : 'Manage your campus resource catalogue — add new spaces, update details, and keep availability current.'}
              </p>

              {canManage && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <button type="button" onClick={() => formPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                    <Plus className="h-4 w-4" /> Add Facility
                  </button>
                  <button type="button" onClick={() => navigate('/bookings')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ background: 'rgba(255,255,255,0.07)', color: '#E5E7EB', border: '1px solid rgba(255,255,255,0.12)' }}>
                    Booking Flow <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <StatBox label="Available" value={stats.active}        accent="#34D399" />
              <StatBox label="Coverage"  value={`${stats.coverage}%`} accent="#34D399" />
              <StatBox label="Avg Seats" value={stats.avgCapacity}    accent="#34D399" />
            </div>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────── */}
        <div className="fp-u1 rounded-2xl bg-white p-5 mb-5"
          style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          <div className="flex items-center flex-wrap gap-2 mb-4">
            <div style={{ width: 3, height: 14, borderRadius: 99, background: '#10B981' }} />
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#374151' }}>
              Filter Facilities
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="fp-stat-pill" style={{ background: '#F8FAFC', color: '#64748B' }}>{filtered.length} shown</span>
              <span className="fp-stat-pill" style={{ background: '#F0FDF4', color: '#059669' }}>{stats.active} active</span>
              {canManage && <span className="fp-stat-pill" style={{ background: '#FFF1F2', color: '#E11D48' }}>{stats.inactive} offline</span>}
            </span>
          </div>

          <div className={`grid gap-3 grid-cols-1 ${canManage ? 'sm:grid-cols-[1fr_180px_180px]' : 'sm:grid-cols-[1fr_200px]'}`}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9CA3AF' }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, location, or description…"
                className="fp-input" style={{ paddingLeft: 40 }} />
            </div>
            <div className="relative">
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="fp-input fp-select">
                <option value="ALL">All types</option>
                {typeOptions.map((t) => <option key={t} value={t}>{prettyType(t)}</option>)}
              </select>
              <Caret />
            </div>
            {canManage && (
              <div className="relative">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="fp-input fp-select">
                  <option value="ALL">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of service</option>
                </select>
                <Caret />
              </div>
            )}
          </div>
        </div>

        {/* ── Main content ───────────────────────────── */}
        <div className={`fp-u2 ${canManage ? 'grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] items-start' : ''}`}>

          <div className="min-w-0">
            {loadingFacilities ? (
              <SkeletonGrid canManage={canManage} />
            ) : filtered.length === 0 ? (
              <EmptyView />
            ) : (
              <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2${canManage ? ' xl:grid-cols-2' : ' xl:grid-cols-3'}`}>
                {filtered.map((f) => (
                  <FacilityCard
                    key={f.id} facility={f}
                    isRegularUser={isRegularUser} canManage={canManage} isAdmin={isAdmin}
                    showDeleteConfirm={showDeleteConfirm}
                    onBook={() => handleBookFacility(f)}
                    onEdit={() => handleEditFacility(f)}
                    onToggleStatus={() => toggleFacilityStatus(f.id)}
                    onDeleteRequest={() => setShowDeleteConfirm(f.id)}
                    onDeleteCancel={() => setShowDeleteConfirm(null)}
                    onDeleteConfirm={() => handleDeleteFacility(f.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {canManage && (
            <div ref={formPanelRef} className="xl:sticky xl:top-6 fp-u3">
              <FormPanel
                form={form} setForm={setForm}
                editingId={editingId}
                onSubmit={handleCreate}
                onCancelEdit={handleCancelEdit}
                onImageUpload={handleImageUpload}
                onClearImage={clearImage}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUB-COMPONENTS
══════════════════════════════════════════════════════════ */

function StatBox({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className="rounded-xl px-4 py-3"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: accent }}>{label}</p>
      <p className="text-2xl font-extrabold leading-none" style={{ color: '#F0FDF4' }}>{value}</p>
    </div>
  );
}

function Caret() {
  return (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function SkeletonGrid({ canManage }: { canManage: boolean }) {
  return (
    <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2${canManage ? ' xl:grid-cols-2' : ' xl:grid-cols-3'}`}>
      {Array.from({ length: canManage ? 4 : 6 }).map((_, i) => (
        <div key={i} className="fp-card">
          <div className="fp-skeleton h-48 w-full" style={{ borderRadius: 0 }} />
          <div className="p-5 space-y-3">
            <div className="fp-skeleton h-4 w-1/3" />
            <div className="fp-skeleton h-5 w-2/3" />
            <div className="fp-skeleton h-3 w-full" />
            <div className="fp-skeleton h-3 w-4/5" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="fp-skeleton h-14" />
              <div className="fp-skeleton h-14" />
            </div>
            <div className="fp-skeleton h-11 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyView() {
  return (
    <div className="rounded-2xl bg-white p-14 text-center"
      style={{ border: '1.5px dashed #D1D5DB' }}>
      <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: '#F0FDF4' }}>
        <Search className="h-7 w-7" style={{ color: '#10B981' }} />
      </div>
      <h3 className="mt-5 text-lg font-extrabold tracking-tight" style={{ color: '#0C1D11' }}>
        No facilities match this view
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: '#6B7280', lineHeight: 1.6 }}>
        Try widening the search, switching the status filter, or picking a different facility type.
      </p>
    </div>
  );
}

function FacilityCard({
  facility, isRegularUser, canManage, isAdmin,
  showDeleteConfirm,
  onBook, onEdit, onToggleStatus,
  onDeleteRequest, onDeleteCancel, onDeleteConfirm,
}: any) {
  const accent = typeAccent[facility.type as Facility['type']];
  const isActive = facility.status === 'ACTIVE';

  return (
    <article className="fp-card group">
      <div className="relative">
        {facility.image ? (
          <img src={facility.image} alt={facility.name}
            className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="h-44 w-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #F5F3EE, #E9E5DC)' }}>
            <Building2 className="h-12 w-12" style={{ color: '#A8A29E' }} />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ background: accent.bg, color: accent.text }}>
            {prettyType(facility.type)}
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] inline-flex items-center gap-1.5"
            style={{
              background: isActive ? '#10B981' : '#E11D48',
              color: '#fff',
              boxShadow: isActive
                ? '0 2px 8px rgba(16,185,129,0.4)'
                : '0 2px 8px rgba(225,29,72,0.4)',
            }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {isActive ? 'Live' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <h3 className="text-lg font-extrabold tracking-tight truncate" style={{ color: '#0C1D11' }}>
            {facility.name}
          </h3>
          <p className="mt-1 text-sm leading-6 line-clamp-2" style={{ color: '#6B7280' }}>
            {facility.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetaBox icon={<MapPin className="h-3 w-3" />} label="Location" value={facility.location} />
          <MetaBox icon={<Users  className="h-3 w-3" />} label="Capacity" value={`${facility.capacity} seats`} />
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button type="button" onClick={onBook} className="fp-btn-primary" disabled={!isActive}>
            <Clock3 className="h-4 w-4" />
            {isRegularUser ? 'Book this facility' : 'Book resource'}
          </button>

          {canManage && (
            <button type="button" onClick={onEdit} className="fp-btn-secondary">
              <Edit className="h-3.5 w-3.5" /> Edit details
            </button>
          )}
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid #F0EDE6' }}>
            {isAdmin && (
              <button type="button" onClick={onToggleStatus} className="fp-btn-warn">
                <ShieldCheck className="h-3 w-3" /> Toggle status
              </button>
            )}
            <button type="button" onClick={onDeleteRequest} className="fp-btn-danger">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}

        {showDeleteConfirm === facility.id && (
          <div className="rounded-xl p-3.5 mt-1"
            style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3' }}>
            <p className="text-sm font-semibold" style={{ color: '#9F1239' }}>
              Delete this facility?
            </p>
            <p className="mt-1 text-xs" style={{ color: '#BE123C' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={onDeleteConfirm}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: '#E11D48' }}>
                Confirm
              </button>
              <button type="button" onClick={onDeleteCancel}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-bold"
                style={{ background: '#fff', color: '#9F1239', border: '1.5px solid #FECDD3' }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function MetaBox({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: '#FAFAF8', border: '1px solid #F0EDE6' }}>
      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em]"
        style={{ color: '#9CA3AF' }}>
        {icon} {label}
      </p>
      <p className="mt-1 text-xs font-semibold truncate" style={{ color: '#374151' }}>
        {value}
      </p>
    </div>
  );
}

function FormPanel({ form, setForm, editingId, onSubmit, onCancelEdit, onImageUpload, onClearImage }: any) {
  return (
    <div className="rounded-2xl bg-white overflow-hidden"
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 24px', borderBottom: '1px solid #F0EDE6' }}>
        <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981' }} />
        <div style={{ width: 30, height: 30, borderRadius: 9, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {editingId
            ? <Wrench className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
            : <Plus className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
          }
        </div>
        <h2 style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151', margin: 0 }}>
          {editingId ? 'Edit Facility' : 'Add Facility'}
        </h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <Field label="Name" required>
          <input required value={form.name}
            onChange={(e) => setForm((c: any) => ({ ...c, name: e.target.value }))}
            className="fp-input" placeholder="e.g. Engineering Lab A" />
        </Field>

        <Field label="Type">
          <div className="relative">
            <select value={form.type}
              onChange={(e) => setForm((c: any) => ({ ...c, type: e.target.value as Facility['type'] }))}
              className="fp-input fp-select">
              {typeOptions.map((t) => <option key={t} value={t}>{prettyType(t)}</option>)}
            </select>
            <Caret />
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Location" required>
            <input required value={form.location}
              onChange={(e) => setForm((c: any) => ({ ...c, location: e.target.value }))}
              className="fp-input" placeholder="e.g. Block C, Floor 2" />
          </Field>
          <Field label="Capacity" required>
            <input required type="number" min={1} value={form.capacity}
              onChange={(e) => setForm((c: any) => ({ ...c, capacity: Number(e.target.value) }))}
              className="fp-input" />
          </Field>
        </div>

        <Field label="Description" required>
          <textarea required rows={3} value={form.description}
            onChange={(e) => setForm((c: any) => ({ ...c, description: e.target.value }))}
            className="fp-input" style={{ resize: 'vertical', minHeight: 90 }}
            placeholder="Describe the facility…" />
        </Field>

        <Field label="Cover image">
          <input type="file" accept="image/*" onChange={onImageUpload}
            className="hidden" id="facility-image-input" />
          <label htmlFor="facility-image-input"
            className="flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-6 rounded-xl text-sm font-semibold transition"
            style={{ border: '1.5px dashed #D1D5DB', background: '#FAFAF8', color: '#6B7280' }}>
            <Upload className="h-4 w-4" /> Select image
          </label>

          {form.image && (
            <div className="relative mt-3 overflow-hidden rounded-xl"
              style={{ border: '1px solid #E5E7EB' }}>
              <img src={form.image} alt="Preview" className="h-32 w-full object-cover" />
              <button type="button" onClick={onClearImage}
                className="absolute right-2 top-2 p-1.5 rounded-full text-white transition"
                style={{ background: '#E11D48' }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </Field>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="fp-btn-primary" style={{ width: 'auto', flex: 1 }}>
            {editingId ? 'Update Facility' : 'Save Facility'}
          </button>
          {editingId && (
            <button type="button" onClick={onCancelEdit} className="fp-btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-extrabold uppercase tracking-[0.18em]"
        style={{ color: '#9CA3AF' }}>
        {label}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}