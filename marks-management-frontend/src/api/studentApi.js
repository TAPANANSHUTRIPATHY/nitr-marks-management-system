import axiosClient from './axiosClient';

export const getStudents = (params) => axiosClient.get('/api/students', { params });
export const getStudent = (id) => axiosClient.get(`/api/students/${id}`);
export const createStudent = (data) => axiosClient.post(`/api/sessions/${data.sessionId}/students`, data);
export const updateStudent = (id, data) => axiosClient.put(`/api/students/${id}`, data);
export const deleteStudent = (id) => axiosClient.delete(`/api/students/${id}`);
export const importStudentsCSV = (formData) => axiosClient.post('/api/students/import', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
