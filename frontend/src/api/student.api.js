import axiosInstance from './axios';

export const studentAPI = {
  getAvailableBatches: () =>
    axiosInstance.get('/batches/student/available'),

  getMyBatches: () =>
    axiosInstance.get('/batches/student/my'),

  enrollInBatch: (batchId) =>
    axiosInstance.post(`/batches/student/${batchId}/enroll`),

  getBatchContents: (batchId) =>
    axiosInstance.get(`/batches/student/${batchId}/contents`),

  markContentComplete: (batchId, contentId) =>
    axiosInstance.post(`/batches/student/${batchId}/contents/${contentId}/complete`),

  markContentIncomplete: (batchId, contentId) =>
    axiosInstance.delete(`/batches/student/${batchId}/contents/${contentId}/complete`),
  getAllAssignments: () =>
    axiosInstance.get('/student/assignment'),

  refreshAssignmentsCache: () =>
    axiosInstance.post('/student/assignment/refresh'),
  submitTextAssignment: (assignmentId, data) =>
    axiosInstance.post(`/student/assignment/${assignmentId}/submit`, data),
  submitFileAssignment: (assignmentId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post(
      `/student/assignment/${assignmentId}/submit-file`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      }
    );
  },
  getMcqAssignment: (assignmentId) =>
    axiosInstance.get(`/student/mcq/${assignmentId}`),

  submitMcqAssignment: (assignmentId, data) =>
    axiosInstance.post(`/student/mcq/${assignmentId}/submit`, data),

  getMcqResult: (assignmentId) =>
    axiosInstance.get(`/student/mcq/${assignmentId}/result`),
};
