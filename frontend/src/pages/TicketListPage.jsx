import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTickets } from '../api/ticketApi';

const statuses = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];
const priorities = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function TicketListPage() {
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetchTickets({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
      });
      setTickets(response);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [filters.status, filters.priority]);

  const empty = useMemo(() => !loading && tickets.length === 0, [loading, tickets.length]);

  return (
    <section className="page">
      <div className="card">
        <h2>Ticket List</h2>
        <div className="row-fields">
          <div className="field">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            >
              {statuses.map((status) => (
                <option key={status || 'ALL_STATUS'} value={status}>
                  {status || 'ALL'}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            >
              {priorities.map((priority) => (
                <option key={priority || 'ALL_PRIORITY'} value={priority}>
                  {priority || 'ALL'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading && <div className="card">Loading tickets...</div>}
      {empty && <div className="card">No tickets found for selected filters.</div>}

      <div className="grid">
        {tickets.map((ticket) => (
          <Link className="ticket-card" to={`/tickets/${ticket.id}`} key={ticket.id}>
            <div className="ticket-meta">#{ticket.id}</div>
            <h3>{ticket.title}</h3>
            <p>{ticket.description.slice(0, 110)}...</p>
            <div className="chips">
              <span className="chip">{ticket.status}</span>
              <span className="chip">{ticket.priority}</span>
              <span className="chip">{ticket.category}</span>
            </div>
            <small>Created by: {ticket.createdBy}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}
