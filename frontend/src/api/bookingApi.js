import apiClient from './client';

export async function createBooking(payload) {
    const { data } = await apiClient.post('/bookings', payload);
    return data;
}

export async function fetchMyBookings() {
    const { data } = await apiClient.get('/bookings/me');
    return data;
}

export async function fetchBookingById(id) {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data;
}

export async function fetchAllBookings(filters = {}) {
    const { data } = await apiClient.get('/bookings', { params: filters });
    return data;
}

export async function approveBooking(id, reviewReason = '') {
    const { data } = await apiClient.put(`/bookings/${id}/approve`, { reviewReason });
    return data;
}

export async function rejectBooking(id, reason) {
    const { data } = await apiClient.put(`/bookings/${id}/reject`, { reason });
    return data;
}

export async function cancelBooking(id, reason) {
    const { data } = await apiClient.put(`/bookings/${id}/cancel`, { reason });
    return data;
}

export async function deleteBooking(id) {
    await apiClient.delete(`/bookings/${id}`);
}

export async function checkAvailability(resourceId, bookingDate) {
    const { data } = await apiClient.get('/bookings/availability', {
        params: { resourceId, bookingDate },
    });
    return data;
}
