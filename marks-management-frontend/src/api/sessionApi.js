import axiosClient from './axiosClient';

export const getSessions = () => axiosClient.get('/api/sessions');
export const getSession = (id) => axiosClient.get(`/api/sessions/${id}`);
export const createSession = (data) => axiosClient.post('/api/sessions', data);
export const updateSession = (id, data) => axiosClient.put(`/api/sessions/${id}`, data);
export const deleteSession = (id) => axiosClient.delete(`/api/sessions/${id}`);
