import axiosClient from './axiosClient';

export const getSubjects = () => axiosClient.get('/api/subjects');
export const getSubject = (id) => axiosClient.get(`/api/subjects/${id}`);
export const createSubject = (data) => axiosClient.post('/api/subjects', data);
export const updateSubject = (id, data) => axiosClient.put(`/api/subjects/${id}`, data);
export const deleteSubject = (id) => axiosClient.delete(`/api/subjects/${id}`);
