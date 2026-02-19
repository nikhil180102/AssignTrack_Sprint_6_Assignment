import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { batchAPI } from '../../api/batch.api';

export const fetchTeacherBatches = createAsyncThunk(
  'batch/fetchTeacherBatches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await batchAPI.getTeacherBatches();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch batches');
    }
  }
);

const normalizeBatch = (item) => {
  if (item?.batch) {
    return {
      id: item.batch.id ?? item.batchId ?? item.id,
      batchCode: item.batch.batchCode,
      name: item.batch.name,
      startDate: item.batch.startDate,
      status: item.batch.status,
      teacherId: item.teacherId,
      studentCount: item.studentCount ?? item.totalStudents ?? 0,
      totalStudents: item.studentCount ?? item.totalStudents ?? 0,
    };
  }
  return item;
};

const batchSlice = createSlice({
  name: 'batch',
  initialState: {
    batches: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherBatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeacherBatches.fulfilled, (state, action) => {
        state.loading = false;
        state.batches = (action.payload || []).map(normalizeBatch);
      })
      .addCase(fetchTeacherBatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default batchSlice.reducer;
