import axiosClient from './axiosClient';

export const getMarks = (semesterSubjectId, section) =>
  axiosClient.get('/api/marks', { params: { semesterSubjectId, section } });
export const batchSaveMarks = (marksArray) =>
  axiosClient.put('/api/marks/batch', marksArray);
export const submitMarks = (semesterSubjectId) =>
  axiosClient.post('/api/marks/submit', { semesterSubjectId });
export const lockMarks = (semesterSubjectId) =>
  axiosClient.post('/api/marks/lock', { semesterSubjectId });
