import axiosInstance from './axios';

export const assignmentAPI = {
  createTextAssignment: (data) =>
    axiosInstance.post('/teacher/assignment', data),
  createMcqAssignment: (data) =>
    axiosInstance.post('/teacher/mcq-assignments', data),
  publishAssignment: (id, type = 'text') =>
    axiosInstance.put(
      type === 'mcq'
        ? `/teacher/mcq-assignments/${id}/publish`
        : `/teacher/assignment/${id}/publish`
    ),

  closeAssignment: (id, type = 'text') =>
    axiosInstance.put(
      type === 'mcq'
        ? `/teacher/mcq-assignments/${id}/close`
        : `/teacher/assignment/${id}/close`
    ),

  getMyAssignments: (params = {}) =>
    axiosInstance.get('/teacher/assignment/my', { params }),

  getAssignmentDetails: (id, type = 'text') =>
    axiosInstance.get(
      type === 'mcq'
        ? `/teacher/mcq-assignments/${id}`
        : `/teacher/assignment/${id}`
    ),

  updateAssignment: (id, data, type = 'text') =>
    axiosInstance.put(
      type === 'mcq'
        ? `/teacher/mcq-assignments/${id}`
        : `/teacher/assignment/${id}`,
      data
    ),

  deleteAssignment: (id, type = 'text') =>
    axiosInstance.delete(
      type === 'mcq'
        ? `/teacher/mcq-assignments/${id}`
        : `/teacher/assignment/${id}`
    ),
  getAssignmentSubmissions: (id, type = 'text') =>
    axiosInstance.get(
      type === 'mcq'
        ? `/teacher/mcq-assignments/${id}/submissions`
        : `/teacher/assignment/${id}/submissions`
    ),
  evaluateSubmission: (assignmentId, studentId, data) =>
    axiosInstance.put(
      `/teacher/assignment/${assignmentId}/evaluate/${studentId}`,
      data
    ),

  downloadSubmissionFile: (assignmentId, studentId) =>
    axiosInstance.get(
      `/teacher/assignment/${assignmentId}/submissions/${studentId}/download`,
      { responseType: 'blob' }
    ),
};

