import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketForm from '../components/TicketForm';
import { createTicket, uploadAttachments } from '../api/ticketApi';

export default function CreateTicketPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (formData, files) => {
    try {
      setLoading(true);
      setError('');
      const ticket = await createTicket(formData);
      if (files.length > 0) {
        await uploadAttachments(ticket.id, files);
      }
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      const apiMessage = err.response?.data?.message || 'Failed to create ticket.';
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      {error && <div className="alert">{error}</div>}
      <TicketForm onSubmit={handleSubmit} loading={loading} />
    </section>
  );
}
