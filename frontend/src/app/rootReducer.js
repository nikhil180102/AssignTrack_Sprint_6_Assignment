import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import batchReducer from '../features/batch/batchSlice';
import assignmentReducer from '../features/assignment/assignmentSlice';
import adminReducer from '../features/admin/adminSlice';
import studentReducer from '../features/student/studentSlice';
import themeReducer from '../features/theme/themeSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  batch: batchReducer,
  assignment: assignmentReducer,
  admin: adminReducer,
  student: studentReducer,
  theme: themeReducer,
});

export default rootReducer;