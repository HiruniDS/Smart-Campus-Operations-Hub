import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { MessageSquare, Plus, Ticket as TicketIcon, X, Upload, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchTickets,
  createTicket as createTicketApi,
  updateTicket as updateTicketApi,
  deleteTicket as deleteTicketApi,
  updateTicketStatus,
  assignTechnician,
  addComment as addCommentApi,
  uploadAttachments,
} from '../api/ticketApi';

/* ─── Types ───────────────────────────────────────────────── */
type TicketStatus   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type ModalMode      = 'create' | 'view' | 'edit' | 'delete' | null;

interface TicketComment   { id: string; content: string; author: string; createdAt: string; }
interface TicketAttachment { id: string; fileName: string; filePath: string; }
interface Ticket {
  id: string; title: string; description: string; category: string;
  priority: TicketPriority; status: TicketStatus;
  createdBy: string; assignedTo: string; createdAt: string;
  comments: TicketComment[]; attachments: TicketAttachment[];
}

/* ─── Config ──────────────────────────────────────────────── */
const priorityOptions: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusOptions:   TicketStatus[]   = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const categoryOptions = ['INCIDENT', 'MAINTENANCE', 'SECURITY', 'FACILITY', 'OTHER'];

const PRIORITY_CFG: Record<TicketPriority, { bg: string; text: string; border: string }> = {
  LOW:      { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  MEDIUM:   { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  HIGH:     { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  CRITICAL: { bg: '#FFF1F2', text: '#E11D48', border: '#FECDD3' },
};

const STATUS_CFG: Record<TicketStatus, { bg: string; text: string; dot: string }> = {
  OPEN:        { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' },
  IN_PROGRESS: { bg: '#FFFBEB', text: '#D97706', dot: '#F59E0B' },
  RESOLVED:    { bg: '#F0FDF4', text: '#16A34A', dot: '#22C55E' },
  CLOSED:      { bg: '#F8FAFC', text: '#64748B', dot: '#94A3B8' },
  REJECTED:    { bg: '#FFF1F2', text: '#E11D48', dot: '#F43F5E' },
};

const CATEGORY_CFG: Record<string, { bg: string; text: string }> = {
  INCIDENT:    { bg: '#FFF1F2', text: '#E11D48' },
  MAINTENANCE: { bg: '#FFFBEB', text: '#D97706' },
  SECURITY:    { bg: '#F5F3FF', text: '#7C3AED' },
  FACILITY:    { bg: '#EFF6FF', text: '#2563EB' },
  OTHER:       { bg: '#F8FAFC', text: '#64748B' },
};

/* ─── Inline styles ───────────────────────────────────────── */
const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
  .tp-root { font-family: 'Outfit', ui-sans-serif, system-ui, sans-serif; }
  @keyframes tpFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .tp-u0 { animation: tpFadeUp .35s ease both; }
  .tp-u1 { animation: tpFadeUp .35s .07s ease both; }
  .tp-u2 { animation: tpFadeUp .35s .14s ease both; }
  .tp-u3 { animation: tpFadeUp .35s .21s ease both; }

  .tp-input {
    width: 100%; box-sizing: border-box;
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid #E5E7EB; background: #FAFAF8;
    font-size: 14px; color: #111827; outline: none; font-family: inherit;
    transition: border-color .15s, box-shadow .15s;
  }
  .tp-input::placeholder { color: #C0BBB0; }
  .tp-input:focus {
    border-color: #10B981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
    background: #fff;
  }
  .tp-select { appearance: none; cursor: pointer; padding-right: 36px; }

  .tp-btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 22px; border-radius: 12px; cursor: pointer; border: none;
    font-size: 13px; font-weight: 700; color: #fff; font-family: inherit;
    background: linear-gradient(135deg, #10B981, #059669);
    box-shadow: 0 3px 12px rgba(16,185,129,0.28);
    transition: filter .15s, transform .15s;
  }
  .tp-btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .tp-btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 18px; border-radius: 11px; cursor: pointer;
    font-size: 13px; font-weight: 700; font-family: inherit;
    background: #fff; color: #374151; border: 1.5px solid #E5E7EB;
    transition: background .15s, border-color .15s, color .15s;
  }
  .tp-btn-ghost:hover { background: #F0FDF4; border-color: #A7F3D0; color: #059669; }

  .tp-btn-danger {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px; cursor: pointer;
    font-size: 12px; font-weight: 700; font-family: inherit;
    background: #FFF1F2; color: #E11D48; border: 1.5px solid #FECDD3;
    transition: background .15s;
  }
  .tp-btn-danger:hover { background: #FFE4E6; }

  .tp-btn-sm {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 9px; cursor: pointer;
    font-size: 12px; font-weight: 700; font-family: inherit;
    background: #FAFAF8; color: #374151; border: 1.5px solid #E5E7EB;
    transition: background .15s;
  }
  .tp-btn-sm:hover { background: #F0FDF4; border-color: #A7F3D0; color: #059669; }

  .tp-ticket-card {
    background: #fff; border: 1px solid rgba(0,0,0,0.07);
    border-radius: 16px; padding: 18px 22px;
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .tp-ticket-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.07);
  }

  /* Modal overlay */
  .tp-overlay {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    background: rgba(12,29,17,0.6);
    backdrop-filter: blur(4px);
  }
  .tp-modal {
    width: 100%; max-width: 600px;
    background: #fff; border-radius: 20px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow: 0 20px 60px rgba(0,0,0,0.18);
    overflow: hidden; max-height: 92vh; overflow-y: auto;
  }
  .tp-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1px solid #F0EDE6; position: sticky; top: 0;
    background: #fff; z-index: 1;
  }
  .tp-modal-body { padding: 22px 24px; }
  .tp-section-row {
    display: flex; align-items: center; gap: 10; padding: 18px 24px;
    border-bottom: 1px solid #F0EDE6;
  }

  .tp-skeleton { background: #F0EDE6; border-radius: 8px; animation: tpPulse 1.4s ease-in-out infinite; }
  @keyframes tpPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
`;

/* ══════════════════════════════════════════════════════════
   PAGE COMPONENT
══════════════════════════════════════════════════════════ */
export default function TicketsHubPage() {
  const { user } = useAuth();

  const [tickets,        setTickets]        = useState<Ticket[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [modalMode,      setModalMode]      = useState<ModalMode>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [commentDraft,   setCommentDraft]   = useState('');
  const [pendingFiles,   setPendingFiles]   = useState<File[]>([]);
  const [actionError,    setActionError]    = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [assigneeInput,  setAssigneeInput]  = useState('');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [form, setForm] = useState({
    title: '', description: '',
    category: 'INCIDENT', priority: 'MEDIUM' as TicketPriority,
  });

  const isAdmin      = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  useEffect(() => { loadTickets(); }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setTickets(await fetchTickets());
    } catch (err) { console.error('Failed to load tickets', err); }
    finally       { setLoading(false); }
  };

  const stats = useMemo(() => ({
    total:    tickets.length,
    open:     tickets.filter((t) => t.status === 'OPEN').length,
    progress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  }), [tickets]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter((t) =>
      `${t.title} ${t.description} ${t.category} ${t.createdBy}`.toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );

  /* ── Modal helpers ── */
  const closeModal = () => {
    setModalMode(null); setActiveTicketId(null);
    setCommentDraft(''); setActionError(''); setPendingFiles([]);
  };
  const resetForm = () => {
    setForm({ title: '', description: '', category: 'INCIDENT', priority: 'MEDIUM' });
    setPendingFiles([]);
  };
  const handleOpenCreate = () => { resetForm(); setModalMode('create'); };
  const handleOpenEdit = (t: Ticket) => {
    setActiveTicketId(t.id);
    setForm({ title: t.title, description: t.description, category: t.category, priority: t.priority });
    setModalMode('edit');
  };

  /* ── API actions ── */
  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setActionError('Title and description are required.'); return;
    }
    try {
      setActionError('');
      const created = await createTicketApi({ title: form.title, description: form.description, category: form.category, priority: form.priority });
      const final = pendingFiles.length > 0 ? await uploadAttachments(created.id, pendingFiles) : created;
      setTickets((prev) => [final, ...prev]);
      resetForm(); closeModal();
    } catch (err: any) { setActionError(err.response?.data?.message || 'Failed to create ticket.'); }
  };

  const handleSaveEdit = async () => {
    if (!activeTicketId) return;
    try {
      setActionError('');
      const updated = await updateTicketApi(activeTicketId, { title: form.title, description: form.description, category: form.category, priority: form.priority });
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
      closeModal();
    } catch (err: any) { setActionError(err.response?.data?.message || 'Failed to update ticket.'); }
  };

  const handleDelete = async () => {
    if (!activeTicketId) return;
    try {
      setActionError('');
      await deleteTicketApi(activeTicketId);
      setTickets((prev) => prev.filter((t) => t.id !== activeTicketId));
      closeModal();
    } catch (err: any) { setActionError(err.response?.data?.message || 'Failed to delete ticket.'); }
  };

  const handleAddComment = async () => {
    if (!activeTicketId || !commentDraft.trim()) return;
    try {
      const updated = await addCommentApi(activeTicketId, commentDraft.trim());
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
      setCommentDraft('');
    } catch (err: any) { setActionError(err.response?.data?.message || 'Failed to add comment.'); }
  };

  const handleStatusUpdate = async () => {
    if (!activeTicketId) return;
    try {
      setActionError('');
      const updated = await updateTicketStatus(activeTicketId, selectedStatus);
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
    } catch (err: any) { setActionError(err.response?.data?.message || 'Failed to update status.'); }
  };

  const handleAssign = async () => {
    if (!activeTicketId || !assigneeInput.trim()) return;
    try {
      setActionError('');
      const updated = await assignTechnician(activeTicketId, assigneeInput.trim());
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
      setAssigneeInput('');
    } catch (err: any) { setActionError(err.response?.data?.message || 'Assignment failed.'); }
  };

  const handleAttachmentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!activeTicketId) return;
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const current = tickets.find((t) => t.id === activeTicketId);
    if (current && current.attachments.length + files.length > 3) {
      setActionError(`Can only upload ${3 - current.attachments.length} more file(s).`); return;
    }
    try {
      setActionError('');
      const updated = await uploadAttachments(activeTicketId, files);
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
    } catch (err: any) { setActionError(err.response?.data?.message || 'Upload failed.'); }
    event.target.value = '';
  };

  const canModify = (t: Ticket) => isAdmin || t.createdBy === (user?.email ?? '');
  const attachmentUrl = (ticketId: string, att: TicketAttachment) =>
    `/api/tickets/${ticketId}/attachments/${att.id}`;

  /* ══════════════════════════════════════════════════════ */
  return (
    <div className="tp-root min-h-screen" style={{ background: '#E9E5DC' }}>
      <style>{STYLE}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">

        {/* ── Breadcrumb ─────────────────────────────── */}
        <nav className="tp-u0 flex items-center gap-1.5 text-xs mb-6">
          <span style={{ color: '#9CA3AF' }} className="font-semibold uppercase tracking-widest">Operations</span>
          <span style={{ color: '#9CA3AF' }}>›</span>
          <span style={{ color: '#6B7280' }} className="font-medium">Tickets</span>
        </nav>

        {/* ── HERO ───────────────────────────────────── */}
        <div className="tp-u0 relative overflow-hidden rounded-2xl mb-6"
          style={{ background: '#0C1D11' }}>

          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }} />
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #059669 100%)' }} />
          <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)' }} />

          <div className="relative px-8 py-9 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ background: 'rgba(16,185,129,0.14)', color: '#34D399' }}>
                <TicketIcon className="h-3 w-3" />
                Support Desk
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2"
                style={{ color: '#F0FDF4' }}>
                Issue Tickets
              </h1>
              <p className="text-sm" style={{ color: '#9CA3AF', lineHeight: 1.7 }}>
                Submit incidents and service requests, track status updates, and collaborate through comments.
              </p>

              {!isTechnician && (
                <div className="flex flex-wrap gap-3 mt-6">
                  <button type="button" onClick={handleOpenCreate}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 16px rgba(16,185,129,0.35)' }}>
                    <Plus className="h-4 w-4" /> New Ticket
                  </button>
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-4 gap-3 shrink-0">
              {[
                { label: 'Total',       value: stats.total,    accent: '#34D399' },
                { label: 'Open',        value: stats.open,     accent: '#60A5FA' },
                { label: 'In Progress', value: stats.progress, accent: '#FCD34D' },
                { label: 'Resolved',    value: stats.resolved, accent: '#34D399' },
              ].map(({ label, value, accent }) => (
                <div key={label} className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: accent }}>{label}</p>
                  <p className="text-2xl font-extrabold leading-none" style={{ color: '#F0FDF4' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Ticket list panel ──────────────────────── */}
        <div className="tp-u1 rounded-2xl bg-white overflow-hidden"
          style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          {/* panel header */}
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #F0EDE6' }}
            className="flex items-center gap-3 flex-wrap">
            <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981', flexShrink: 0 }} />
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TicketIcon className="h-3.5 w-3.5" style={{ color: '#10B981' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#374151' }}>
              Active Queue
            </span>
            {filtered.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: '#F0FDF4', color: '#059669' }}>
                {filtered.length}
              </span>
            )}

            {/* search */}
            <div className="ml-auto relative" style={{ minWidth: 220 }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#9CA3AF' }} />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets…"
                className="tp-input" style={{ paddingLeft: 34, paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
            </div>
          </div>

          {/* list body */}
          <div className="p-4 space-y-3">

            {/* skeleton */}
            {loading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-5" style={{ background: '#FAFAF8', border: '1px solid #F0EDE6' }}>
                <div className="space-y-2.5">
                  <div className="tp-skeleton h-3 w-1/4" />
                  <div className="tp-skeleton h-5 w-1/2" />
                  <div className="tp-skeleton h-3 w-3/4" />
                </div>
              </div>
            ))}

            {/* empty */}
            {!loading && filtered.length === 0 && (
              <div className="rounded-2xl p-12 text-center"
                style={{ border: '1.5px dashed #D1D5DB' }}>
                <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: '#F0FDF4' }}>
                  <TicketIcon className="h-6 w-6" style={{ color: '#10B981' }} />
                </div>
                <p className="font-extrabold text-sm" style={{ color: '#0C1D11' }}>No tickets found</p>
                <p className="mt-1 text-xs" style={{ color: '#9CA3AF' }}>
                  {isAdmin ? 'No tickets yet in the system.' : 'You have not submitted any tickets yet.'}
                </p>
              </div>
            )}

            {/* ticket cards */}
            {!loading && filtered.map((ticket) => {
              const priority = PRIORITY_CFG[ticket.priority];
              const status   = STATUS_CFG[ticket.status];
              const category = CATEGORY_CFG[ticket.category] ?? CATEGORY_CFG.OTHER;
              return (
                <article key={ticket.id} className="tp-ticket-card">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      {/* category + title */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] px-2 py-0.5 rounded-full"
                          style={{ background: category.bg, color: category.text }}>
                          {ticket.category}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                          style={{ background: status.bg, color: status.text }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold tracking-tight" style={{ color: '#0C1D11' }}>
                        {ticket.title}
                      </h3>
                      <p className="mt-1 text-sm line-clamp-2" style={{ color: '#6B7280', lineHeight: 1.6 }}>
                        {ticket.description}
                      </p>
                    </div>
                    {/* priority badge */}
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                      style={{ background: priority.bg, color: priority.text, border: `1px solid ${priority.border}` }}>
                      {ticket.priority}
                    </span>
                  </div>

                  {/* meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs" style={{ color: '#9CA3AF' }}>
                    <span>By <strong style={{ color: '#374151' }}>{ticket.createdBy}</strong></span>
                    {ticket.assignedTo && (
                      <span>Assigned to <strong style={{ color: '#374151' }}>{ticket.assignedTo}</strong></span>
                    )}
                    {ticket.comments.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {ticket.comments.length}
                      </span>
                    )}
                  </div>

                  {/* attachments */}
                  {ticket.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {ticket.attachments.map((att) => (
                        <a key={att.id} href={attachmentUrl(ticket.id, att)} target="_blank" rel="noreferrer"
                          className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full transition"
                          style={{ background: '#EFF6FF', color: '#2563EB' }}>
                          {att.fileName}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* action buttons */}
                  <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid #F5F3EE' }}>
                    <button type="button" className="tp-btn-sm"
                      onClick={() => { setActiveTicketId(ticket.id); setModalMode('view'); }}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    {canModify(ticket) && (
                      <button type="button" className="tp-btn-sm"
                        onClick={() => handleOpenEdit(ticket)}>
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    )}
                    {canModify(ticket) && (
                      <button type="button" className="tp-btn-danger"
                        onClick={() => { setActiveTicketId(ticket.id); setModalMode('delete'); }}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════ */}
      {modalMode && (
        <div className="tp-overlay">
          <div className="tp-modal">

            {/* modal header */}
            <div className="tp-modal-header">
              <div className="flex items-center gap-3">
                <div style={{ width: 3, height: 18, borderRadius: 99, background: '#10B981' }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0C1D11', margin: 0 }}>
                  {modalMode === 'create' && 'Create Ticket'}
                  {modalMode === 'view'   && 'Ticket Details'}
                  {modalMode === 'edit'   && 'Edit Ticket'}
                  {modalMode === 'delete' && 'Delete Ticket'}
                </h3>
              </div>
              <button type="button" onClick={closeModal}
                className="p-2 rounded-full transition"
                style={{ background: '#F5F3EE', color: '#6B7280' }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Create / Edit form ── */}
            {(modalMode === 'create' || modalMode === 'edit') && (
              <div className="tp-modal-body space-y-4">
                <FormField label="Title" required>
                  <input required value={form.title}
                    onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                    className="tp-input" placeholder="Brief summary of the issue" />
                </FormField>

                <FormField label="Description" required>
                  <textarea required rows={4} value={form.description}
                    onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
                    className="tp-input" style={{ resize: 'vertical', minHeight: 90 }}
                    placeholder="Describe the issue in detail…" />
                </FormField>

                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField label="Category">
                    <div className="relative">
                      <select value={form.category}
                        onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}
                        className="tp-input tp-select">
                        {categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <SelectCaret />
                    </div>
                  </FormField>
                  <FormField label="Priority">
                    <div className="relative">
                      <select value={form.priority}
                        onChange={(e) => setForm((c) => ({ ...c, priority: e.target.value as TicketPriority }))}
                        className="tp-input tp-select">
                        {priorityOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <SelectCaret />
                    </div>
                  </FormField>
                </div>

                {modalMode === 'create' && (
                  <FormField label="Images (max 3)">
                    <input type="file" accept="image/*" multiple
                      onChange={(e) => {
                        setPendingFiles(Array.from(e.target.files ?? []).slice(0, 3));
                        e.target.value = '';
                      }}
                      className="hidden" id="ticket-file-input" />
                    <label htmlFor="ticket-file-input"
                      className="flex items-center justify-center gap-2 px-4 py-5 rounded-xl cursor-pointer text-sm font-semibold"
                      style={{ border: '1.5px dashed #D1D5DB', background: '#FAFAF8', color: '#6B7280' }}>
                      <Upload className="h-4 w-4" />
                      {pendingFiles.length > 0 ? pendingFiles.map((f) => f.name).join(', ') : 'Select images'}
                    </label>
                  </FormField>
                )}

                {actionError && (
                  <p className="text-xs font-semibold px-3 py-2 rounded-lg"
                    style={{ background: '#FFF1F2', color: '#E11D48' }}>{actionError}</p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" className="tp-btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="button" className="tp-btn-primary"
                    onClick={modalMode === 'create' ? handleCreate : handleSaveEdit}>
                    <Plus className="h-4 w-4" />
                    {modalMode === 'create' ? 'Create Ticket' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── View modal ── */}
            {modalMode === 'view' && activeTicket && (
              <div className="tp-modal-body space-y-4">

                {/* title + badges */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
                      style={{ background: (CATEGORY_CFG[activeTicket.category] ?? CATEGORY_CFG.OTHER).bg, color: (CATEGORY_CFG[activeTicket.category] ?? CATEGORY_CFG.OTHER).text }}>
                      {activeTicket.category}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                      style={{ background: STATUS_CFG[activeTicket.status].bg, color: STATUS_CFG[activeTicket.status].text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CFG[activeTicket.status].dot }} />
                      {activeTicket.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full"
                      style={{ background: PRIORITY_CFG[activeTicket.priority].bg, color: PRIORITY_CFG[activeTicket.priority].text, border: `1px solid ${PRIORITY_CFG[activeTicket.priority].border}` }}>
                      {activeTicket.priority}
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold tracking-tight" style={{ color: '#0C1D11' }}>
                    {activeTicket.title}
                  </h4>
                  <p className="mt-2 text-sm" style={{ color: '#6B7280', lineHeight: 1.7 }}>
                    {activeTicket.description}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs" style={{ color: '#9CA3AF' }}>
                    <span>By <strong style={{ color: '#374151' }}>{activeTicket.createdBy}</strong></span>
                    {activeTicket.assignedTo && (
                      <span>Assigned to <strong style={{ color: '#374151' }}>{activeTicket.assignedTo}</strong></span>
                    )}
                  </div>
                </div>

                {/* attachments */}
                <SectionBox label={`Attachments (${activeTicket.attachments.length}/3)`}>
                  <div className="flex flex-wrap gap-2">
                    {activeTicket.attachments.map((att) => (
                      <a key={att.id} href={attachmentUrl(activeTicket.id, att)} target="_blank" rel="noreferrer"
                        className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                        style={{ background: '#EFF6FF', color: '#2563EB' }}>
                        {att.fileName}
                      </a>
                    ))}
                    {activeTicket.attachments.length === 0 && (
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>No attachments yet.</p>
                    )}
                  </div>
                  {activeTicket.attachments.length < 3 && (
                    <div className="mt-2">
                      <input type="file" accept="image/*" multiple onChange={handleAttachmentUpload}
                        className="hidden" id="view-upload-input" />
                      <label htmlFor="view-upload-input"
                        className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold px-3 py-1.5 rounded-lg"
                        style={{ background: '#F0FDF4', color: '#059669', border: '1px solid #A7F3D0' }}>
                        <Upload className="h-3.5 w-3.5" /> Upload more
                      </label>
                    </div>
                  )}
                </SectionBox>

                {/* status update (admin / tech) */}
                {(isAdmin || isTechnician) && (
                  <SectionBox label="Update Status">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                          className="tp-input tp-select" style={{ paddingTop: 8, paddingBottom: 8, fontSize: 13 }}>
                          {statusOptions.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                        <SelectCaret />
                      </div>
                      <button type="button" onClick={handleStatusUpdate} className="tp-btn-primary"
                        style={{ width: 'auto', padding: '8px 18px' }}>
                        Apply
                      </button>
                    </div>
                  </SectionBox>
                )}

                {/* assign (admin only) */}
                {isAdmin && (
                  <SectionBox label="Assign Technician">
                    <div className="flex gap-2">
                      <input value={assigneeInput} onChange={(e) => setAssigneeInput(e.target.value)}
                        placeholder="Technician email…" className="tp-input flex-1"
                        style={{ paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
                      <button type="button" onClick={handleAssign} className="tp-btn-primary"
                        style={{ width: 'auto', padding: '8px 18px' }}>
                        Assign
                      </button>
                    </div>
                  </SectionBox>
                )}

                {/* comments */}
                <SectionBox label="Comments">
                  <div className="space-y-2 mb-3">
                    {activeTicket.comments.length === 0 && (
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>No comments yet.</p>
                    )}
                    {activeTicket.comments.map((c) => (
                      <div key={c.id} className="px-3 py-2.5 rounded-xl"
                        style={{ background: '#FAFAF8', border: '1px solid #F0EDE6' }}>
                        <p className="text-xs font-bold mb-0.5" style={{ color: '#059669' }}>{c.author}</p>
                        <p className="text-sm" style={{ color: '#374151' }}>{c.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)}
                      placeholder="Add a comment…" className="tp-input flex-1"
                      style={{ paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
                    <button type="button" onClick={handleAddComment} className="tp-btn-primary"
                      style={{ width: 'auto', padding: '8px 16px' }}>
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </SectionBox>

                {actionError && (
                  <p className="text-xs font-semibold px-3 py-2 rounded-lg"
                    style={{ background: '#FFF1F2', color: '#E11D48' }}>{actionError}</p>
                )}
              </div>
            )}

            {/* ── Delete confirm ── */}
            {modalMode === 'delete' && activeTicket && (
              <div className="tp-modal-body space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-xl"
                  style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3' }}>
                  <Trash2 className="h-5 w-5 shrink-0 mt-0.5" style={{ color: '#E11D48' }} />
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#9F1239' }}>
                      Delete "{activeTicket.title}"?
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#BE123C' }}>
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                {actionError && (
                  <p className="text-xs font-semibold px-3 py-2 rounded-lg"
                    style={{ background: '#FFF1F2', color: '#E11D48' }}>{actionError}</p>
                )}
                <div className="flex justify-end gap-3">
                  <button type="button" className="tp-btn-ghost" onClick={closeModal}>Cancel</button>
                  <button type="button" className="tp-btn-danger" onClick={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete ticket
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Helper sub-components ──────────────────────────────── */
function FormField({ label, required, children }: { label: string; required?: boolean; children: any }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#9CA3AF' }}>
        {label}{required && <span style={{ color: '#E11D48', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionBox({ label, children }: { label: string; children: any }) {
  return (
    <div className="rounded-xl p-4" style={{ border: '1px solid #F0EDE6', background: '#FAFAF8' }}>
      <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#9CA3AF', marginBottom: 10 }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function SelectCaret() {
  return (
    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}