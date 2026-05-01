import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { MessageSquare, Plus, Ticket as TicketIcon, X } from 'lucide-react';
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

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'REJECTED';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface TicketComment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

interface TicketAttachment {
  id: string;
  fileName: string;
  filePath: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  assignedTo: string;
  createdAt: string;
  comments: TicketComment[];
  attachments: TicketAttachment[];
}

const priorityOptions: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusOptions: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const categoryOptions = ['INCIDENT', 'MAINTENANCE', 'SECURITY', 'FACILITY', 'OTHER'];
type ModalMode = 'create' | 'view' | 'edit' | 'delete' | null;
const acceptedAttachmentTypes = 'image/*';

export default function TicketsHubPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<TicketAttachment | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [actionError, setActionError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [assigneeInput, setAssigneeInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'INCIDENT',
    priority: 'MEDIUM' as TicketPriority,
  });

  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    progress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
  }), [tickets]);

  const closeModal = () => {
    setModalMode(null);
    setActiveTicketId(null);
    setCommentDraft('');
    setActionError('');
    setPendingFiles([]);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', category: 'INCIDENT', priority: 'MEDIUM' });
    setPendingFiles([]);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []).slice(0, 3);
    setPendingFiles(selected);
    event.target.value = '';
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setActionError('Title and description are required.');
      return;
    }
    try {
      setActionError('');
      const created = await createTicketApi({
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
      });
      let final = created;
      if (pendingFiles.length > 0) {
        final = await uploadAttachments(created.id, pendingFiles);
      }
      setTickets((prev) => [final, ...prev]);
      resetForm();
      closeModal();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to create ticket.');
    }
  };

  const handleOpenCreate = () => {
    resetForm();
    setModalMode('create');
  };

  const handleOpenEdit = (ticket: Ticket) => {
    setActiveTicketId(ticket.id);
    setForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
    });
    setModalMode('edit');
  };

  const handleSaveEdit = async () => {
    if (!activeTicketId) return;
    try {
      setActionError('');
      const updated = await updateTicketApi(activeTicketId, {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
      });
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
      closeModal();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update ticket.');
    }
  };

  const handleDelete = async () => {
    if (!activeTicketId) return;
    try {
      setActionError('');
      await deleteTicketApi(activeTicketId);
      setTickets((prev) => prev.filter((t) => t.id !== activeTicketId));
      closeModal();
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  const handleAddComment = async () => {
    if (!activeTicketId) return;
    const value = commentDraft.trim();
    if (!value) return;
    try {
      const updated = await addCommentApi(activeTicketId, value);
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
      setCommentDraft('');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add comment.');
    }
  };

  const handleStatusUpdate = async () => {
    if (!activeTicketId) return;
    try {
      setActionError('');
      const updated = await updateTicketStatus(activeTicketId, selectedStatus);
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleAssign = async () => {
    if (!activeTicketId || !assigneeInput.trim()) return;
    try {
      setActionError('');
      const updated = await assignTechnician(activeTicketId, assigneeInput.trim());
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
      setAssigneeInput('');
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Assignment failed.');
    }
  };

  const handleAttachmentUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!activeTicketId) return;
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const activeTicket = tickets.find((t) => t.id === activeTicketId);
    if (activeTicket && activeTicket.attachments.length + files.length > 3) {
      setActionError(`Can only upload ${3 - activeTicket.attachments.length} more file(s).`);
      return;
    }
    try {
      setActionError('');
      const updated = await uploadAttachments(activeTicketId, files);
      setTickets((prev) => prev.map((t) => t.id === activeTicketId ? updated : t));
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Upload failed.');
    }
    event.target.value = '';
  };

  const canModifyTicket = (ticket: Ticket) => isAdmin || ticket.createdBy === (user?.email ?? '');

  const attachmentUrl = (ticketId: string, att: TicketAttachment) =>
    `/api/tickets/${ticketId}/attachments/${att.id}`;

  const activeTicket = useMemo(
    () => tickets.find((t) => t.id === activeTicketId) ?? null,
    [tickets, activeTicketId],
  );


  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700">
              <TicketIcon className="h-3.5 w-3.5" />
              Support desk
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">Issue tickets</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              Submit incidents and service requests, track status updates, and collaborate through comments.
            </p>
          </div>

          <div className="space-y-3">
            {!isTechnician && (
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                New Ticket
              </button>
            )}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-black text-slate-950">{stats.total}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">Open</p>
              <p className="mt-1 text-2xl font-black text-blue-700">{stats.open}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-600">In progress</p>
              <p className="mt-1 text-2xl font-black text-amber-700">{stats.progress}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">Resolved</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">{stats.resolved}</p>
            </div>
          </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Active queue</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Ticket list</h2>
          </div>

          {loading && <p className="text-sm font-medium text-slate-400">Loading tickets...</p>}

          <div className="space-y-3">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{ticket.category}</p>
                    <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950">{ticket.title}</h3>
                    <p className="mt-2 text-sm text-slate-500">{ticket.description}</p>
                  </div>
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700">
                    {ticket.priority}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">{ticket.status}</span>
                  <span>by {ticket.createdBy}</span>
                  <span>assigned to {ticket.assignedTo}</span>
                </div>
                {ticket.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {ticket.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachmentUrl(ticket.id, attachment)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 hover:bg-indigo-100"
                      >
                        {attachment.fileName}
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTicketId(ticket.id);
                      setModalMode('view');
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    View
                  </button>
                  {canModifyTicket(ticket) && (
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(ticket)}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Edit
                    </button>
                  )}
                  {canModifyTicket(ticket) && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTicketId(ticket.id);
                        setModalMode('delete');
                      }}
                      className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          {!loading && tickets.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
              {isAdmin ? 'No tickets yet in the system.' : 'You have not submitted any tickets yet.'}
            </div>
          )}
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight text-slate-950">
                {modalMode === 'create' && 'Create Ticket'}
                {modalMode === 'view' && 'Ticket Details'}
                {modalMode === 'edit' && 'Edit Ticket'}
                {modalMode === 'delete' && 'Delete Ticket'}
              </h3>
              <button type="button" onClick={closeModal} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            {(modalMode === 'create' || modalMode === 'edit') && (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Title</label>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                  />
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Category</label>
                    <select
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                    >
                      {categoryOptions.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Priority</label>
                    <select
                      value={form.priority}
                      onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TicketPriority }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {modalMode === 'create' && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Images (max 3)</label>
                    <input
                      type="file"
                      accept={acceptedAttachmentTypes}
                      multiple
                      onChange={handleFileSelect}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                    />
                    {pendingFiles.length > 0 && (
                      <p className="mt-2 text-xs font-medium text-slate-500">{pendingFiles.map((f) => f.name).join(', ')}</p>
                    )}
                  </div>
                )}
                {actionError && <p className="text-xs font-semibold text-rose-600">{actionError}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={modalMode === 'create' ? handleCreate : handleSaveEdit}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                  >
                    <Plus className="h-4 w-4" />
                    {modalMode === 'create' ? 'Create' : 'Save changes'}
                  </button>
                </div>
              </div>
            )}

            {modalMode === 'view' && activeTicket && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">{activeTicket.category}</p>
                  <h4 className="mt-1 text-lg font-black tracking-tight text-slate-950">{activeTicket.title}</h4>
                  <p className="mt-2 text-sm text-slate-600">{activeTicket.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">{activeTicket.priority}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">{activeTicket.status}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">by {activeTicket.createdBy}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">assigned to {activeTicket.assignedTo}</span>
                </div>
                <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attachments ({activeTicket.attachments.length}/3)</p>
                  <div className="flex flex-wrap gap-2">
                    {activeTicket.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachmentUrl(activeTicket.id, attachment)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 hover:bg-indigo-100"
                      >
                        {attachment.fileName}
                      </a>
                    ))}
                  </div>
                  {activeTicket.attachments.length < 3 && (
                    <input
                      type="file"
                      accept={acceptedAttachmentTypes}
                      multiple
                      onChange={handleAttachmentUpload}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-2 file:py-1 file:text-xs file:font-bold file:text-white"
                    />
                  )}
                </div>
                {(isAdmin || isTechnician) && (
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Update status</p>
                    <div className="flex gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as TicketStatus)}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none"
                      >
                        {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button type="button" onClick={handleStatusUpdate} className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600">Apply</button>
                    </div>
                  </div>
                )}
                {isAdmin && (
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Assign technician</p>
                    <div className="flex gap-2">
                      <input
                        value={assigneeInput}
                        onChange={(e) => setAssigneeInput(e.target.value)}
                        placeholder="Technician email"
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none"
                      />
                      <button type="button" onClick={handleAssign} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Assign</button>
                    </div>
                  </div>
                )}
                <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                  {activeTicket.comments.map((comment) => (
                    <p key={comment.id} className="text-sm text-slate-600">
                      <span className="font-bold text-slate-700">{comment.author}:</span> {comment.content}
                    </p>
                  ))}
                  {activeTicket.comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}
                </div>
                <div className="flex gap-2">
                  <input
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Add a comment..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Send
                  </button>
                </div>
                {actionError && <p className="text-xs font-semibold text-rose-600">{actionError}</p>}
              </div>
            )}

            {modalMode === 'delete' && activeTicket && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{activeTicket.title}</span>? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white"
                  >
                    Delete ticket
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </section>
  );
}
