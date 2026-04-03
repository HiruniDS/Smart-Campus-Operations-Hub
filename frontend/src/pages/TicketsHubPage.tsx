import { useMemo, useState, type ChangeEvent } from 'react';
import { MessageSquare, Plus, Ticket as TicketIcon, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  addTicket,
  addTicketComment,
  deleteTicket,
  getTickets,
  updateTicketDetails,
  type TicketAttachment,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
} from '@/lib/mergedStore';

const priorityOptions: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const statusOptions: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
type ModalMode = 'create' | 'view' | 'edit' | 'delete' | null;
const acceptedAttachmentTypes = '.jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.csv';

export default function TicketsHubPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(() => getTickets());
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [previewAttachment, setPreviewAttachment] = useState<TicketAttachment | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'INCIDENT',
    priority: 'MEDIUM' as TicketPriority,
    status: 'OPEN' as TicketStatus,
    assignedTo: 'unassigned',
    attachments: [] as TicketAttachment[],
  });

  const isAdmin = user?.role === 'ADMIN';
  const currentUserName = user?.name ?? 'Guest';

  const visibleTickets = useMemo(() => {
    if (isAdmin) return tickets;
    return tickets.filter((ticket) => ticket.createdBy === currentUserName);
  }, [tickets, isAdmin, currentUserName]);

  const stats = useMemo(() => {
    return {
      total: visibleTickets.length,
      open: visibleTickets.filter((ticket) => ticket.status === 'OPEN').length,
      progress: visibleTickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length,
      resolved: visibleTickets.filter((ticket) => ticket.status === 'RESOLVED' || ticket.status === 'CLOSED').length,
    };
  }, [visibleTickets]);

  const closeModal = () => {
    setModalMode(null);
    setActiveTicketId(null);
    setCommentDraft('');
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      category: 'INCIDENT',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: 'unassigned',
      attachments: [],
    });
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleAttachmentSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const uploadedAttachments: TicketAttachment[] = [];
    for (const file of files) {
      const url = await fileToDataUrl(file);
      uploadedAttachments.push({
        id: `att-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        type: file.type,
        url,
        size: file.size,
      });
    }

    setForm((current) => ({
      ...current,
      attachments: [...current.attachments, ...uploadedAttachments],
    }));
    event.target.value = '';
  };

  const removeAttachment = (attachmentId: string) => {
    setForm((current) => ({
      ...current,
      attachments: current.attachments.filter((item) => item.id !== attachmentId),
    }));
  };

  const handleCreate = () => {
    const next = addTicket({
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: form.status,
      createdBy: currentUserName,
      assignedTo: form.assignedTo.trim() || 'unassigned',
      attachments: form.attachments,
    });

    setTickets(next);
    resetForm();
    closeModal();
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
      status: ticket.status,
      assignedTo: ticket.assignedTo,
      attachments: ticket.attachments,
    });
    setModalMode('edit');
  };

  const handleSaveEdit = () => {
    if (!activeTicketId) return;
    const next = updateTicketDetails(activeTicketId, {
      title: form.title,
      description: form.description,
      category: form.category,
      priority: form.priority,
      status: form.status,
      assignedTo: form.assignedTo.trim() || 'unassigned',
      attachments: form.attachments,
    });
    setTickets(next);
    closeModal();
  };

  const handleDelete = () => {
    if (!activeTicketId) return;
    const next = deleteTicket(activeTicketId);
    setTickets(next);
    closeModal();
  };

  const handleAddComment = () => {
    if (!activeTicketId) return;
    const value = commentDraft.trim();
    if (!value) return;

    const next = addTicketComment(activeTicketId, currentUserName, value);
    setTickets(next);
    setCommentDraft('');
  };

  const canModifyTicket = (ticket: Ticket) => isAdmin || ticket.createdBy === currentUserName;

  const activeTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === activeTicketId) ?? null,
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
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
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

          <div className="space-y-3">
            {visibleTickets.map((ticket) => (
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
                      <button
                        key={attachment.id}
                        type="button"
                        onClick={() => setPreviewAttachment(attachment)}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 hover:bg-indigo-100"
                      >
                        {attachment.name}
                      </button>
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

          {visibleTickets.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-medium text-slate-500">
              {isAdmin ? 'No tickets yet in the system.' : 'You have not created any tickets yet.'}
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
                    <input
                      value={form.category}
                      onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                    />
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
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Status</label>
                    <select
                      value={form.status}
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TicketStatus }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Assign to</label>
                    <input
                      value={form.assignedTo}
                      onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))}
                      placeholder="technician name or email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attachments</label>
                  <input
                    type="file"
                    accept={acceptedAttachmentTypes}
                    multiple
                    onChange={handleAttachmentSelect}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                  />
                  {form.attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1">
                          <button
                            type="button"
                            onClick={() => setPreviewAttachment(attachment)}
                            className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700"
                          >
                            {attachment.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeAttachment(attachment.id)}
                            className="text-[10px] font-bold text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                {activeTicket.attachments.length > 0 && (
                  <div className="space-y-2 rounded-2xl border border-slate-200 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Attachments</p>
                    <div className="flex flex-wrap gap-2">
                      {activeTicket.attachments.map((attachment) => (
                        <button
                          key={attachment.id}
                          type="button"
                          onClick={() => setPreviewAttachment(attachment)}
                          className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 hover:bg-indigo-100"
                        >
                          {attachment.name}
                        </button>
                      ))}
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

      {previewAttachment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900">{previewAttachment.name}</h4>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
              {previewAttachment.type.startsWith('image/') ? (
                <img src={previewAttachment.url} alt={previewAttachment.name} className="mx-auto max-h-[64vh] w-auto rounded-lg" />
              ) : previewAttachment.type === 'application/pdf' ? (
                <iframe src={previewAttachment.url} title={previewAttachment.name} className="h-[64vh] w-full rounded-lg bg-white" />
              ) : (
                <div className="space-y-3 p-4 text-sm text-slate-600">
                  <p>Preview is not available for this file type.</p>
                  <a
                    href={previewAttachment.url}
                    download={previewAttachment.name}
                    className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                  >
                    Download file
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
