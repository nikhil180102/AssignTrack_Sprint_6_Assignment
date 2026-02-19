import api from './axios';

export const userAPI = {
  getUserById: (id) => api.get(`/users/${id}`),
  getMyProfile: () => api.get('/users/profile'),
  updateMyProfile: (data) => api.put('/users/profile', data),
  updateTeacherProfile: (formData) =>
    api.put('/users/profile/teacher', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  changePassword: (data) => api.put('/users/change-password', data),
};

