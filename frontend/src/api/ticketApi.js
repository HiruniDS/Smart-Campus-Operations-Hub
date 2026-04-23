import apiClient from './client';

export async function createTicket(payload) {
  const { data } = await apiClient.post('/tickets', payload);
  return data;
}

export async function fetchTickets(filters = {}) {
  const { data } = await apiClient.get('/tickets', { params: filters });
  return data;
}

export async function fetchTicketById(id) {
  const { data } = await apiClient.get(`/tickets/${id}`);
  return data;
}

export async function updateTicket(id, payload) {
  const { data } = await apiClient.put(`/tickets/${id}`, payload);
  return data;
}

export async function deleteTicket(id) {
  await apiClient.delete(`/tickets/${id}`);
}

export async function assignTechnician(id, technicianUsername) {
  const { data } = await apiClient.post(`/tickets/${id}/assign`, { technicianUsername });
  return data;
}

export async function updateTicketStatus(id, status) {
  const { data } = await apiClient.post(`/tickets/${id}/status`, { status });
  return data;
}

export async function addComment(id, content) {
  const { data } = await apiClient.post(`/tickets/${id}/comments`, { content });
  return data;
}

export async function uploadAttachments(id, files) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const { data } = await apiClient.post(`/tickets/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
