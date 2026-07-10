import axiosClient from './axiosClient';

export const getSemesters = () => axiosClient.get('/api/semesters');
export const getSemestersBySession = (sessionId) => axiosClient.get(`/api/sessions/${sessionId}/semesters`);
export const createSemester = (data) => axiosClient.post(`/api/sessions/${data.sessionId}/semesters`, data);
export const updateSemester = (id, data) => axiosClient.put(`/api/semesters/${id}`, data);
export const deleteSemester = (id) => axiosClient.delete(`/api/semesters/${id}`);
export const mapSubjectToSemester = (semesterId, subjectId) =>
  axiosClient.post(`/api/semesters/${semesterId}/subjects/${subjectId}`);
export const unmapSubjectFromSemester = (semesterId, subjectId) =>
  axiosClient.delete(`/api/semesters/${semesterId}/subjects/${subjectId}`);
export const getSubjectsForSemester = (semesterId) =>
  axiosClient.get(`/api/semesters/${semesterId}/subjects`);
