import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherMyBatches from '../pages/teacher/MyBatches';
import BatchDetails from '../pages/teacher/BatchDetails';
import MyAssignments from '../pages/teacher/MyAssignments';
import AssignmentDetails from '../pages/teacher/AssignmentDetails';
import EditAssignment from '../pages/teacher/EditAssignment';
import TeacherProfile from '../pages/teacher/TeacherProfile';
import Placeholder from '../pages/teacher/Placeholder';
import Submissions from '../pages/teacher/Submissions';
import AdminDashboard from '../pages/admin/AdminDashboard';
import TeacherApprovals from '../pages/admin/TeacherApprovals';
import BatchManagement from '../pages/admin/BatchManagement';
import BatchDetailsAdmin from '../pages/admin/BatchDetailsAdmin';
import StudentDashboard from '../pages/student/StudentDashboard';
import AvailableBatches from '../pages/student/AvailableBatches';
import StudentMyBatches from '../pages/student/MyBatches';
import StudentBatchDetails from '../pages/student/BatchDetails';
import AllAssignments from '../pages/student/AllAssignments';
import McqAssignmentAttempt from '../pages/student/McqAssignmentAttempt';
import McqResult from '../pages/student/McqResult';
import TextAssignmentSubmit from '../pages/student/TextAssignmentSubmit';
import StudentProfile from '../pages/student/StudentProfile';
import StudentPlaceholder from '../pages/student/Placeholder';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <Navigate to={`/${user?.role?.toLowerCase()}/dashboard`} replace />
    );
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const redirectPath = user?.role
    ? `/${user?.role.toLowerCase()}/dashboard`
    : "/login";

  return (
    <Routes>
<Route path="/" element={<LandingPage />} />
<Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to={redirectPath} />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? <Register /> : <Navigate to={redirectPath} />
        }
      />
<Route
        path="/teacher"
        element={<Navigate to="/teacher/dashboard" replace />}
      />
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/batches"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherMyBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/batches/:batchId"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <BatchDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <MyAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <AssignmentDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/assignments/:assignmentId/edit"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <EditAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/submissions"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <Submissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/settings"
        element={
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <Placeholder title="Settings" />
          </ProtectedRoute>
        }
      />
<Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <TeacherApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batches"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BatchManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batches/:batchId"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BatchDetailsAdmin />
          </ProtectedRoute>
        }
      />
<Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/batches/available"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AvailableBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/batches"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentMyBatches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/batches/:batchId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentBatchDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AllAssignments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments/mcq/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <McqAssignmentAttempt />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments/mcq/:assignmentId/result"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <McqResult />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments/text/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <TextAssignmentSubmit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/assignments/file/:assignmentId"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <TextAssignmentSubmit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/profile"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/settings"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentPlaceholder title="Settings" />
          </ProtectedRoute>
        }
      />
<Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

