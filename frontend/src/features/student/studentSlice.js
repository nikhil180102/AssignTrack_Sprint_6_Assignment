import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { studentAPI } from '../../api/student.api';
import toast from 'react-hot-toast';
import { addSubmittedId } from '../../utils/submissionStatus';

export const fetchAvailableBatches = createAsyncThunk(
  'student/fetchAvailableBatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getAvailableBatches();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchMyBatches = createAsyncThunk(
  'student/fetchMyBatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getMyBatches();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const enrollInBatch = createAsyncThunk(
  'student/enrollInBatch',
  async (batchId, { rejectWithValue }) => {
    try {
      await studentAPI.enrollInBatch(batchId);
      try {
        await studentAPI.refreshAssignmentsCache();
      } catch (e) {
      }
      toast.success('Successfully enrolled in batch!');
      return batchId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchBatchAssignments = createAsyncThunk(
  'student/fetchBatchAssignments',
  async (batchId, { rejectWithValue }) => {
    try {
      const response = await studentAPI.getAllAssignments();
      const list = response.data.data || [];
      return list.filter((a) => String(a.batchId) === String(batchId));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const submitTextAssignment = createAsyncThunk(
  'student/submitTextAssignment',
  async ({ assignmentId, data }, { rejectWithValue, getState }) => {
    try {
      await studentAPI.submitTextAssignment(assignmentId, data);
      const userId = getState().auth?.user?.id ?? null;
      addSubmittedId(assignmentId, userId);
      toast.success('Assignment submitted successfully!');
      return assignmentId;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const submitFileAssignment = createAsyncThunk(
  'student/submitFileAssignment',
  async ({ assignmentId, file, onUploadProgress }, { rejectWithValue, getState }) => {
    try {
      await studentAPI.submitFileAssignment(assignmentId, file, onUploadProgress);
      const userId = getState().auth?.user?.id ?? null;
      addSubmittedId(assignmentId, userId);
      toast.success('File assignment submitted successfully!');
      return assignmentId;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (Array.isArray(error?.response?.data?.data)
          ? error.response.data.data[0]
          : null) ||
        'Failed to upload file';
      return rejectWithValue(message);
    }
  }
);

export const submitMcqAssignment = createAsyncThunk(
  'student/submitMcqAssignment',
  async ({ assignmentId, data }, { rejectWithValue, getState }) => {
    try {
      const response = await studentAPI.submitMcqAssignment(assignmentId, data);
      const userId = getState().auth?.user?.id ?? null;
      addSubmittedId(assignmentId, userId);
      toast.success('Quiz submitted successfully!');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState: {
    availableBatches: [],
    myBatches: [],
    batchAssignments: [],
    loading: false,
    enrolling: false,
    submitting: false,
    error: null,
    selectedBatch: null,
  },
  reducers: {
    setSelectedBatch: (state, action) => {
      state.selectedBatch = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableBatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.availableBatches = action.payload;
      })
      .addCase(fetchAvailableBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMyBatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.myBatches = action.payload;
      })
      .addCase(fetchMyBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(enrollInBatch.pending, (state) => {
        state.enrolling = true;
      })
      .addCase(enrollInBatch.fulfilled, (state, action) => {
        state.enrolling = false;
        state.availableBatches = state.availableBatches.filter(
          (b) => b.id !== action.payload
        );
      })
      .addCase(enrollInBatch.rejected, (state) => {
        state.enrolling = false;
      })
      .addCase(fetchBatchAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBatchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.batchAssignments = action.payload;
      })
      .addCase(fetchBatchAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitTextAssignment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitTextAssignment.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitTextAssignment.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(submitMcqAssignment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitMcqAssignment.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitMcqAssignment.rejected, (state) => {
        state.submitting = false;
      })
      .addCase(submitFileAssignment.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitFileAssignment.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(submitFileAssignment.rejected, (state) => {
        state.submitting = false;
      });
  },
});

export const { setSelectedBatch, clearError } = studentSlice.actions;
export default studentSlice.reducer;
