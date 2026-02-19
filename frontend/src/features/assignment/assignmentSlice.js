import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { assignmentAPI } from '../../api/assignment.api';
import toast from 'react-hot-toast';

export const fetchMyAssignments = createAsyncThunk(
  'assignment/fetchMy',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await assignmentAPI.getMyAssignments(params);
      const pageData = response.data.data || {};
      return {
        content: pageData.content || [],
        page: pageData.number ?? params.page ?? 0,
        size: pageData.size ?? params.size ?? 6,
        totalElements: pageData.totalElements ?? 0,
        totalPages: pageData.totalPages ?? 0,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }
);

const normalizeAssignment = (assignment) => ({
  ...assignment,
  assignmentId: assignment.assignmentId ?? assignment.id,
});

export const createTextAssignment = createAsyncThunk(
  'assignment/createText',
  async (data, { rejectWithValue }) => {
    try {
      const response = await assignmentAPI.createTextAssignment(data);
      toast.success('Assignment created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create assignment');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createMcqAssignment = createAsyncThunk(
  'assignment/createMcq',
  async (data, { rejectWithValue }) => {
    try {
      const response = await assignmentAPI.createMcqAssignment(data);
      toast.success('MCQ assignment created successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create MCQ assignment');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const publishAssignment = createAsyncThunk(
  'assignment/publish',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await assignmentAPI.publishAssignment(id, type);
      toast.success('Assignment published successfully');
      return { id, status: 'PUBLISHED' };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish assignment');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const closeAssignment = createAsyncThunk(
  'assignment/close',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await assignmentAPI.closeAssignment(id, type);
      toast.success('Assignment closed successfully');
      return { id, status: 'CLOSED' };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to close assignment');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignment/update',
  async ({ id, data, type }, { rejectWithValue }) => {
    try {
      const response = await assignmentAPI.updateAssignment(id, data, type);
      toast.success('Assignment updated successfully');
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update assignment');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignment/delete',
  async ({ id, type }, { rejectWithValue }) => {
    try {
      await assignmentAPI.deleteAssignment(id, type);
      toast.success('Assignment deleted successfully');
      return { id };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete assignment');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState: {
    assignments: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      type: 'all', // all, TEXT, MCQ, FILE
      status: 'all', // all, DRAFT, PUBLISHED, CLOSED
    },
    pagination: {
      page: 0,
      size: 6,
      totalElements: 0,
      totalPages: 0,
    },
  },
  reducers: {
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
    },
    setTypeFilter: (state, action) => {
      state.filters.type = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },
    clearFilters: (state) => {
      state.filters = { search: '', type: 'all', status: 'all' };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = (action.payload.content || []).map(normalizeAssignment);
        state.pagination = {
          page: action.payload.page,
          size: action.payload.size,
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchMyAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTextAssignment.fulfilled, (state, action) => {
        state.assignments.push(normalizeAssignment(action.payload));
      })
      .addCase(createMcqAssignment.fulfilled, (state, action) => {
        state.assignments.push(normalizeAssignment(action.payload));
      })
      .addCase(publishAssignment.fulfilled, (state, action) => {
        const assignment = state.assignments.find(a => a.assignmentId === action.payload.id);
        if (assignment) assignment.status = action.payload.status;
      })
      .addCase(closeAssignment.fulfilled, (state, action) => {
        const assignment = state.assignments.find(a => a.assignmentId === action.payload.id);
        if (assignment) assignment.status = action.payload.status;
      })
      .addCase(updateAssignment.fulfilled, (state, action) => {
        const updated = normalizeAssignment(action.payload);
        const idx = state.assignments.findIndex(a => a.assignmentId === updated.assignmentId);
        if (idx !== -1) {
          state.assignments[idx] = { ...state.assignments[idx], ...updated };
        }
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments = state.assignments.filter(
          a => a.assignmentId !== action.payload.id
        );
      });
  },
});

export const { setSearchFilter, setTypeFilter, setStatusFilter, clearFilters } = assignmentSlice.actions;
export default assignmentSlice.reducer;
