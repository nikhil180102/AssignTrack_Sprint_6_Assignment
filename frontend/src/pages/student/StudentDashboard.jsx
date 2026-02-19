import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Zap,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { fetchMyBatches, fetchAvailableBatches } from '../../features/student/studentSlice';
import { studentAPI } from '../../api/student.api';
import { getSubmittedIds } from '../../utils/submissionStatus';
import { getUserId } from '../../utils/auth';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myBatches, availableBatches, loading } = useSelector((state) => state.student);
  const [assignments, setAssignments] = useState([]);
  const [assignmentCounts, setAssignmentCounts] = useState({});
  const userId = getUserId();
  const getBatchKey = (batch) => String(batch?.batchId ?? batch?.id ?? '');

  useEffect(() => {
    dispatch(fetchMyBatches());
    dispatch(fetchAvailableBatches());
  }, [dispatch]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const res = await studentAPI.getAllAssignments();
        const list = res.data.data || [];
        const submittedIds = getSubmittedIds(userId);
        const normalized = list.map((a) => ({
          ...a,
          submitted: a.submitted === true || submittedIds.has(Number(a.assignmentId)),
        }));
        setAssignments(normalized);
        const counts = normalized.reduce((acc, a) => {
          const key = String(a.batchId ?? '');
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setAssignmentCounts(counts);
      } catch (e) {
        console.log(e);
        setAssignments([]);
        setAssignmentCounts({});
      }
    };
    loadAssignments();
  }, [userId]);

  const completedCount = assignments.filter((a) => a.submitted).length;

  const stats = [
    {
      icon: BookOpen,
      label: 'Enrolled Batches',
      value: myBatches?.length || 0,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      icon: FileText,
      label: 'Active Assignments',
      value: assignments.length,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      icon: CheckCircle2,
      label: 'Completed',
      value: completedCount,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
<div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-6 h-6" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Welcome Back!
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Ready to Learn?</h1>
            <p className="text-purple-100 text-lg">
              You have {availableBatches?.length || 0} new courses available to explore
            </p>
          </div>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-xl bg-white p-5 border border-slate-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-2.5 rounded-lg bg-slate-900"
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-slate-300" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
<div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Batches</h2>
            <button
              onClick={() => navigate('/student/batches')}
              className="text-slate-700 hover:text-slate-900 font-medium flex items-center space-x-2 text-sm"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : myBatches?.length > 0 ? (
            <div className="space-y-3">
              {myBatches.slice(0, 3).map((batch, index) => {
                const batchKey = getBatchKey(batch);
                const totalAssignments = assignmentCounts[batchKey] || 0;
                const completedAssignments = (assignments || []).filter(
                  (a) => String(a.batchId ?? '') === batchKey && a.submitted
                ).length;
                return (
                <div
                  key={batch.id || index}
                  onClick={() => navigate(`/student/batches/${batch.batchId || batch.id}`)}
                  className="bg-white rounded-xl p-5 hover:shadow-sm transition-all duration-300 cursor-pointer border border-slate-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                          {batch.batchName || batch.name || 'Batch Name'}
                        </h3>
                        <p className="text-sm text-gray-600 font-mono">
                          {batch.batchCode || 'BATCH-CODE'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {totalAssignments}
                        </p>
                        <p className="text-xs text-gray-500">Assignments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-700">
                          {completedAssignments}
                        </p>
                        <p className="text-xs text-gray-500">Completed</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Batches Enrolled Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Explore available batches and start your learning journey
              </p>
              <button
                onClick={() => navigate('/student/batches')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Browse Batches
              </button>
            </div>
          )}
        </div>

      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;

