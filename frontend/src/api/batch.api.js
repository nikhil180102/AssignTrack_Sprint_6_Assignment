import axiosInstance from './axios';

export const batchAPI = {
  getTeacherBatches: () =>
    axiosInstance.get('/batches/teacher/my'),

  getBatchDetails: (id) =>
    axiosInstance.get(`/batches/teacher/${id}`),

  getTeacherBatchContents: (batchId) =>
    axiosInstance.get(`/batches/teacher/${batchId}/contents`),

  addTeacherBatchContent: (batchId, data) =>
    axiosInstance.post(`/batches/teacher/${batchId}/contents`, data),

  updateTeacherBatchContent: (batchId, contentId, data) =>
    axiosInstance.put(`/batches/teacher/${batchId}/contents/${contentId}`, data),

  removeTeacherBatchContent: (batchId, contentId) =>
    axiosInstance.delete(`/batches/teacher/${batchId}/contents/${contentId}`),
};

