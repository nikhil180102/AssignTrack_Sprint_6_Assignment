import api from "./axios";

export const notificationApi = {
  getNotifications: (role, userId) => {
    const path =
      role === "ADMIN"
        ? "/admin/notification"
        : role === "TEACHER"
        ? "/teacher/notification"
        : "/student/notification";
    return userId
      ? api.get(path, { params: { userId } })
      : api.get(path);
  },
  markRead: (id) => api.put(`/notification/${id}/read`),
  clearAll: (userId) => api.delete(`/notification/clear`, { params: { userId } }),
  deleteOne: (id) => api.delete(`/notification/${id}`),
};

