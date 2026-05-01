import apiClient from './client';

export async function fetchAllFacilities() {
    const { data } = await apiClient.get('/facilities');
    return data;
}

export async function fetchActiveFacilities() {
    const { data } = await apiClient.get('/facilities/active');
    return data;
}

export async function fetchFacilityById(id) {
    const { data } = await apiClient.get(`/facilities/${id}`);
    return data;
}

export async function createFacility(payload) {
    const { data } = await apiClient.post('/facilities', payload);
    return data;
}

export async function updateFacility(id, payload) {
    const { data } = await apiClient.put(`/facilities/${id}`, payload);
    return data;
}

export async function deleteFacility(id) {
    await apiClient.delete(`/facilities/${id}`);
}
