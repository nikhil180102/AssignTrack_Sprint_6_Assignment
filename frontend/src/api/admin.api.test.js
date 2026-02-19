import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockGet,
  mockPost,
  mockPut,
  mockDelete,
} = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('./axios', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

import { adminAPI } from './admin.api';

describe('adminAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls correct teacher endpoints', () => {
    adminAPI.getPendingTeachers();
    adminAPI.getApprovedTeachers();
    adminAPI.getRejectedTeachers();
    adminAPI.approveTeacher(7);
    adminAPI.rejectTeacher(8);

    expect(mockGet).toHaveBeenCalledWith('/admin/teachers?status=PENDING');
    expect(mockGet).toHaveBeenCalledWith('/admin/teachers?status=APPROVED');
    expect(mockGet).toHaveBeenCalledWith('/admin/teachers?status=REJECTED');
    expect(mockPut).toHaveBeenCalledWith('/admin/teachers/7/approve');
    expect(mockPut).toHaveBeenCalledWith('/admin/teachers/8/reject');
  });

  it('calls correct batch endpoints', () => {
    adminAPI.createBatch({ name: 'B1' });
    adminAPI.getAllBatches();
    adminAPI.publishBatch(21);
    adminAPI.closeBatch(22);
    adminAPI.getBatchDetails(23);

    expect(mockPost).toHaveBeenCalledWith('/admin/batches', { name: 'B1' });
    expect(mockGet).toHaveBeenCalledWith('/admin/batches');
    expect(mockPut).toHaveBeenCalledWith('/admin/batches/21/publish');
    expect(mockPut).toHaveBeenCalledWith('/admin/batches/22/close');
    expect(mockGet).toHaveBeenCalledWith('/admin/batches/23');
  });

  it('calls correct teacher assignment endpoints', () => {
    adminAPI.assignTeacherToBatch(11, 501);
    adminAPI.removeTeacherFromBatch(11, 501);
    adminAPI.getBatchTeachers(11);

    expect(mockPost).toHaveBeenCalledWith('/admin/batches/11/teachers', { teacherId: 501 });
    expect(mockDelete).toHaveBeenCalledWith('/admin/batches/11/teachers/501');
    expect(mockGet).toHaveBeenCalledWith('/admin/batches/11/teachers');
  });
});

