import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/admin.api', () => ({
  adminAPI: {
    getPendingTeachers: vi.fn(),
    approveTeacher: vi.fn(),
    rejectTeacher: vi.fn(),
    getAllBatches: vi.fn(),
    createBatch: vi.fn(),
    publishBatch: vi.fn(),
    assignTeacherToBatch: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import reducer, {
  approveTeacher,
  clearError,
  createBatch,
  fetchAllBatches,
  fetchPendingTeachers,
  publishBatch,
  rejectTeacher,
} from './adminSlice';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';

function makeStore(preloadedState) {
  return configureStore({
    reducer: { admin: reducer },
    preloadedState: preloadedState ? { admin: preloadedState } : undefined,
  });
}

describe('adminSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles fetchPendingTeachers success', async () => {
    const teachers = [{ id: 1 }, { id: 2 }];
    adminAPI.getPendingTeachers.mockResolvedValue({ data: { data: teachers } });
    const store = makeStore();

    await store.dispatch(fetchPendingTeachers());

    const state = store.getState().admin;
    expect(state.teachers.pending).toEqual(teachers);
    expect(state.teachers.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('handles fetchPendingTeachers failure', async () => {
    adminAPI.getPendingTeachers.mockRejectedValue({
      response: { data: { message: 'Failed to load pending teachers' } },
    });
    const store = makeStore();

    await store.dispatch(fetchPendingTeachers());

    const state = store.getState().admin;
    expect(state.teachers.loading).toBe(false);
    expect(state.error).toBe('Failed to load pending teachers');
  });

  it('removes approved teacher from pending and shows success toast', async () => {
    adminAPI.approveTeacher.mockResolvedValue({});
    const store = makeStore({
      teachers: {
        pending: [{ id: 1 }, { id: 2 }],
        approved: [],
        rejected: [],
        loading: false,
      },
      batches: { list: [], loading: false, selectedBatch: null },
      error: null,
    });

    await store.dispatch(approveTeacher(1));

    expect(store.getState().admin.teachers.pending).toEqual([{ id: 2 }]);
    expect(toast.success).toHaveBeenCalledWith('Instructor approved successfully');
  });

  it('handles approveTeacher failure and shows error toast', async () => {
    adminAPI.approveTeacher.mockRejectedValue({
      response: { data: { message: 'Not allowed' } },
    });
    const store = makeStore();

    const action = await store.dispatch(approveTeacher(10));

    expect(action.type).toBe('admin/approveTeacher/rejected');
    expect(action.payload).toBe('Not allowed');
    expect(toast.error).toHaveBeenCalledWith('Not allowed');
  });

  it('removes rejected teacher from pending', async () => {
    adminAPI.rejectTeacher.mockResolvedValue({});
    const store = makeStore({
      teachers: {
        pending: [{ id: 3 }, { id: 4 }],
        approved: [],
        rejected: [],
        loading: false,
      },
      batches: { list: [], loading: false, selectedBatch: null },
      error: null,
    });

    await store.dispatch(rejectTeacher(3));

    expect(store.getState().admin.teachers.pending).toEqual([{ id: 4 }]);
    expect(toast.success).toHaveBeenCalledWith('Instructor rejected');
  });

  it('sets batch status to PUBLISHED after publishBatch', async () => {
    adminAPI.publishBatch.mockResolvedValue({});
    const store = makeStore({
      teachers: { pending: [], approved: [], rejected: [], loading: false },
      batches: {
        list: [{ id: 11, status: 'DRAFT' }, { id: 22, status: 'PUBLISHED' }],
        loading: false,
        selectedBatch: null,
      },
      error: null,
    });

    await store.dispatch(publishBatch(11));

    const updated = store.getState().admin.batches.list.find((b) => b.id === 11);
    expect(updated.status).toBe('PUBLISHED');
  });

  it('appends newly created batch to list', async () => {
    const newBatch = { id: 99, status: 'DRAFT' };
    adminAPI.createBatch.mockResolvedValue({ data: { data: newBatch } });
    const store = makeStore({
      teachers: { pending: [], approved: [], rejected: [], loading: false },
      batches: {
        list: [{ id: 1, status: 'PUBLISHED' }],
        loading: false,
        selectedBatch: null,
      },
      error: null,
    });

    await store.dispatch(createBatch({ name: 'Batch 99' }));

    expect(store.getState().admin.batches.list).toEqual([
      { id: 1, status: 'PUBLISHED' },
      { id: 99, status: 'DRAFT' },
    ]);
    expect(toast.success).toHaveBeenCalledWith('Batch created successfully');
  });

  it('clearError resets error to null', () => {
    const start = {
      teachers: { pending: [], approved: [], rejected: [], loading: false },
      batches: { list: [], loading: false, selectedBatch: null },
      error: 'Some error',
    };

    const next = reducer(start, clearError());
    expect(next.error).toBeNull();
  });

  it('handles fetchAllBatches failure', async () => {
    adminAPI.getAllBatches.mockRejectedValue({
      response: { data: { message: 'Unable to fetch batches' } },
    });
    const store = makeStore();

    await store.dispatch(fetchAllBatches());

    expect(store.getState().admin.error).toBe('Unable to fetch batches');
  });
});
