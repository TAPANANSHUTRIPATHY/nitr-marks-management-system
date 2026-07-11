import axiosClient from './axiosClient';

export const getFaculty = () => axiosClient.get('/api/faculty');
export const getFacultyMember = (id) => axiosClient.get(`/api/faculty/${id}`);
export const createFaculty = (data) => axiosClient.post('/api/faculty', data);
export const updateFaculty = (id, data) => axiosClient.put(`/api/faculty/${id}`, data);
export const deleteFaculty = (id) => axiosClient.delete(`/api/faculty/${id}`);
export const importFacultyCSV = (formData) => axiosClient.post('/api/faculty/import', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const assignFaculty = (data) => axiosClient.post('/api/faculty/assign', data);
export const getFacultyAssignments = (id) => axiosClient.get(`/api/faculty/${id}/assignments`);
export const getMyAssignments = () => axiosClient.get('/api/faculty/me/assignments');
export const getAssignmentsBySubject = (semesterSubjectId) => axiosClient.get(`/api/faculty/assignments/subject/${semesterSubjectId}`);
export const removeAssignment = (assignmentId) => axiosClient.delete(`/api/faculty/assignments/${assignmentId}`);
