import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Search
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import BatchCard from '../../components/teacher/BatchCard';
import AssignmentCard from '../../components/teacher/AssignmentCard';
import { fetchTeacherBatches } from '../../features/batch/batchSlice';
import { fetchMyAssignments } from '../../features/assignment/assignmentSlice';

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { batches, loading: batchesLoading } = useSelector((state) => state.batch);
  const { assignments, loading: assignmentsLoading } = useSelector((state) => state.assignment);

  useEffect(() => {
    dispatch(fetchTeacherBatches());
    dispatch(fetchMyAssignments({ page: 0, size: 1000 }));
  }, [dispatch]);
  const totalStudents = batches?.reduce(
    (acc, batch) =>
      acc +
      (batch.totalStudents ??
        batch.studentCount ??
        batch.studentsCount ??
        0),
    0
  );

  const totalSubmissions = assignments?.reduce(
    (acc, assignment) =>
      acc +
      (assignment.totalSubmissions ??
        assignment.submissionCount ??
        assignment.submissionsCount ??
        0),
    0
  );

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Batches',
      value: batches?.length || 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: FileText,
      label: 'Total Assignments',
      value: assignments?.length || 0,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Users,
      label: 'Active Students',
      value: totalStudents || 0,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      label: 'Submissions',
      value: totalSubmissions || 0,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const assignmentCountByBatch = (assignments || []).reduce((acc, assignment) => {
    const key = String(assignment.batchId);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-8">
<div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your overview.</p>
          </div>
          <Button
            icon={Plus}
            onClick={() => navigate('/teacher/batches')}
          >
            Create Assignment
          </Button>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} dark:bg-gray-700/80`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
<div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Batches</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/teacher/batches')}
            >
              View All
            </Button>
          </div>

          {batchesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : batches?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.slice(0, 3).map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={{
                    ...batch,
                    assignmentCount:
                      assignmentCountByBatch[String(batch.id)] ?? batch.assignmentCount ?? 0,
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No batches assigned yet</p>
            </Card>
          )}
        </div>
<div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Assignments</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/teacher/assignments')}
            >
              View All
            </Button>
          </div>

          {assignmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : assignments?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.slice(0, 3).map((assignment) => (
                <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No assignments created yet</p>
              <Button onClick={() => navigate('/teacher/batches')}>
                Create Your First Assignment
              </Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;

