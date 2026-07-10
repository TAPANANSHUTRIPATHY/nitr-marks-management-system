import axiosClient from './axiosClient';

export const getMarks = (semesterSubjectId) =>
  axiosClient.get(`/api/marks/${semesterSubjectId}`);
export const batchSaveMarks = (semesterSubjectId, marksArray) =>
  axiosClient.put(`/api/marks/${semesterSubjectId}/batch`, marksArray);
export const submitMarks = (semesterSubjectId) =>
  axiosClient.post(`/api/marks/${semesterSubjectId}/submit`);
export const lockMarks = (semesterSubjectId) =>
  axiosClient.post(`/api/marks/${semesterSubjectId}/lock`);
