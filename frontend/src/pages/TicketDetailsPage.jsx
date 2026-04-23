import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  addComment,
  assignTechnician,
  fetchTicketById,
  updateTicketStatus,
  uploadAttachments,
} from '../api/ticketApi';
import { useAuth } from '../context/AuthContext';

const statuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('IN_PROGRESS');
  const [assignee, setAssignee] = useState('tech1');

  const canAssign = currentUser.role === 'ADMIN';
  const canUpdateStatus = currentUser.role === 'ADMIN' || currentUser.role === 'TECHNICIAN';

  const loadTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchTicketById(id);
      setTicket(data);
      setSelectedStatus(data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const remainingUploads = useMemo(() => {
    if (!ticket) return 3;
    return Math.max(0, 3 - ticket.attachments.length);
  }, [ticket]);

  const handleAssign = async () => {
    try {
      const updated = await assignTechnician(ticket.id, assignee);
      setTicket(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Assignment failed.');
    }
  };

  const handleStatus = async () => {
    try {
      const updated = await updateTicketStatus(ticket.id, selectedStatus);
      setTicket(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const updated = await addComment(ticket.id, commentText);
      setTicket(updated);
      setCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Comment add failed.');
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > remainingUploads) {
      setError(`You can only upload ${remainingUploads} more file(s).`);
      return;
    }
    try {
      const updated = await uploadAttachments(ticket.id, files);
      setTicket(updated);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    }
  };

  if (loading) return <section className="page"><div className="card">Loading details...</div></section>;
  if (!ticket) return <section className="page"><div className="card">Ticket not found.</div></section>;

  return (
    <section className="page">
      {error && <div className="alert">{error}</div>}
      <article className="card">
        <h2>{ticket.title}</h2>
        <p>{ticket.description}</p>
        <div className="chips">
          <span className="chip">Status: {ticket.status}</span>
          <span className="chip">Priority: {ticket.priority}</span>
          <span className="chip">Category: {ticket.category}</span>
        </div>
        <p><strong>Created by:</strong> {ticket.createdBy}</p>
        <p><strong>Assigned to:</strong> {ticket.assignedTo || 'Not assigned'}</p>
      </article>

      {canAssign && (
        <article className="card">
          <h3>Assign Technician</h3>
          <div className="inline-actions">
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="tech1">tech1</option>
              <option value="tech2">tech2</option>
            </select>
            <button onClick={handleAssign}>Assign</button>
          </div>
        </article>
      )}

      {canUpdateStatus && (
        <article className="card">
          <h3>Update Status</h3>
          <div className="inline-actions">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button onClick={handleStatus}>Update</button>
          </div>
        </article>
      )}

      <article className="card">
        <h3>Attachments ({ticket.attachments.length}/3)</h3>
        {remainingUploads > 0 && (
          <input type="file" multiple accept="image/*" onChange={handleUpload} />
        )}
        <ul className="list">
          {ticket.attachments.map((attachment) => (
            <li key={attachment.id}>{attachment.fileName}</li>
          ))}
        </ul>
      </article>

      <article className="card">
        <h3>Comments</h3>
        <form onSubmit={handleComment} className="inline-form">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment"
            maxLength={500}
          />
          <button type="submit">Post</button>
        </form>
        <ul className="list">
          {ticket.comments.map((comment) => (
            <li key={comment.id}>
              <strong>{comment.author}:</strong> {comment.content}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
