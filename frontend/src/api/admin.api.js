import axiosInstance from './axios';

export const adminAPI = {
  getPendingTeachers: () =>
    axiosInstance.get('/admin/teachers?status=PENDING'),

  getApprovedTeachers: () =>
    axiosInstance.get('/admin/teachers?status=APPROVED'),

  getRejectedTeachers: () =>
    axiosInstance.get('/admin/teachers?status=REJECTED'),

  approveTeacher: (teacherId) =>
    axiosInstance.put(`/admin/teachers/${teacherId}/approve`),

  rejectTeacher: (teacherId) =>
    axiosInstance.put(`/admin/teachers/${teacherId}/reject`),
  createBatch: (data) =>
    axiosInstance.post('/admin/batches', data),

  getAllBatches: () =>
    axiosInstance.get('/admin/batches'),

  publishBatch: (batchId) =>
    axiosInstance.put(`/admin/batches/${batchId}/publish`),

  closeBatch: (batchId) =>
    axiosInstance.put(`/admin/batches/${batchId}/close`),

  getBatchDetails: (batchId) =>
    axiosInstance.get(`/admin/batches/${batchId}`),
  assignTeacherToBatch: (batchId, teacherId) =>
    axiosInstance.post(`/admin/batches/${batchId}/teachers`, { teacherId }),

  removeTeacherFromBatch: (batchId, teacherId) =>
    axiosInstance.delete(`/admin/batches/${batchId}/teachers/${teacherId}`),

  getBatchTeachers: (batchId) =>
    axiosInstance.get(`/admin/batches/${batchId}/teachers`),
  getBatchContents: (batchId) =>
    axiosInstance.get(`/admin/batches/${batchId}/contents`),

  updateBatchContent: (batchId, contentId, data) =>
    axiosInstance.put(`/admin/batches/${batchId}/contents/${contentId}`, data),

  removeBatchContent: (batchId, contentId) =>
    axiosInstance.delete(`/admin/batches/${batchId}/contents/${contentId}`),

  downloadTeacherCertification: (teacherId) =>
    axiosInstance.get(`/admin/teachers/${teacherId}/certification`, { responseType: 'blob' }),
};

