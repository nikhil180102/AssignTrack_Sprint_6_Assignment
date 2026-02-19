import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
export const fetchPendingTeachers = createAsyncThunk(
  'admin/fetchPendingTeachers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getPendingTeachers();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveTeacher = createAsyncThunk(
  'admin/approveTeacher',
  async (teacherId, { rejectWithValue }) => {
    try {
      await adminAPI.approveTeacher(teacherId);
      toast.success('Instructor approved successfully');
      return teacherId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve instructor');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectTeacher = createAsyncThunk(
  'admin/rejectTeacher',
  async (teacherId, { rejectWithValue }) => {
    try {
      await adminAPI.rejectTeacher(teacherId);
      toast.success('Instructor rejected');
      return teacherId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject instructor');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
export const fetchAllBatches = createAsyncThunk(
  'admin/fetchAllBatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllBatches();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createBatch = createAsyncThunk(
  'admin/createBatch',
  async (data, { rejectWithValue }) => {
    try {
      const response = await adminAPI.createBatch(data);
      toast.success('Batch created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create batch');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const publishBatch = createAsyncThunk(
  'admin/publishBatch',
  async (batchId, { rejectWithValue }) => {
    try {
      await adminAPI.publishBatch(batchId);
      toast.success('Batch published successfully');
      return batchId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish batch');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const assignTeacherToBatch = createAsyncThunk(
  'admin/assignTeacherToBatch',
  async ({ batchId, teacherId }, { rejectWithValue }) => {
    try {
      await adminAPI.assignTeacherToBatch(batchId, teacherId);
      toast.success('Instructor assigned successfully');
      return { batchId, teacherId };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign instructor');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    teachers: {
      pending: [],
      approved: [],
      rejected: [],
      loading: false,
    },
    batches: {
      list: [],
      loading: false,
      selectedBatch: null,
    },
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingTeachers.pending, (state) => {
        state.teachers.loading = true;
      })
      .addCase(fetchPendingTeachers.fulfilled, (state, action) => {
        state.teachers.loading = false;
        state.teachers.pending = action.payload;
      })
      .addCase(fetchPendingTeachers.rejected, (state, action) => {
        state.teachers.loading = false;
        state.error = action.payload;
      })
      .addCase(approveTeacher.fulfilled, (state, action) => {
        state.teachers.pending = state.teachers.pending.filter(
          (t) => t.id !== action.payload
        );
      })
      .addCase(rejectTeacher.fulfilled, (state, action) => {
        state.teachers.pending = state.teachers.pending.filter(
          (t) => t.id !== action.payload
        );
      })
      .addCase(fetchAllBatches.pending, (state) => {
        state.batches.loading = true;
      })
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.batches.loading = false;
        state.batches.list = action.payload;
      })
      .addCase(fetchAllBatches.rejected, (state, action) => {
        state.batches.loading = false;
        state.error = action.payload;
      })
      .addCase(createBatch.fulfilled, (state, action) => {
        state.batches.list.push(action.payload);
      })
      .addCase(publishBatch.fulfilled, (state, action) => {
        const batch = state.batches.list.find((b) => b.id === action.payload);
        if (batch) batch.status = 'PUBLISHED';
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
