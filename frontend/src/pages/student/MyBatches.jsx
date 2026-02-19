import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { fetchMyBatches } from '../../features/student/studentSlice';
import { studentAPI } from '../../api/student.api';
import { getSubmittedIds } from '../../utils/submissionStatus';
import { getUserId } from '../../utils/auth';

const MyBatches = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myBatches, loading } = useSelector((state) => state.student);
  const [assignmentCounts, setAssignmentCounts] = useState({});
  const [completedCounts, setCompletedCounts] = useState({});
  const userId = getUserId();

  useEffect(() => {
    dispatch(fetchMyBatches());
  }, [dispatch]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const response = await studentAPI.getAllAssignments();
        const list = response.data.data || [];
        const submittedIds = getSubmittedIds(userId);
        const normalized = list.map((a) => ({
          ...a,
          submitted: a.submitted === true || submittedIds.has(Number(a.assignmentId)),
        }));
        const counts = normalized.reduce((acc, a) => {
          const key = String(a.batchId);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setAssignmentCounts(counts);
        const completed = normalized.reduce((acc, a) => {
          if (!a.submitted) return acc;
          const key = String(a.batchId);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setCompletedCounts(completed);
      } catch (e) {
        setAssignmentCounts({});
        setCompletedCounts({});
      }
    };

    if ((myBatches || []).length > 0) {
      loadCounts();
    }
  }, [myBatches, userId]);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
<div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">My Batches</h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Track your progress across all enrolled courses
            </p>
          </div>
          <button
            onClick={() => navigate('/student/batches/available')}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all"
          >
            Browse More Batches
          </button>
        </div>
{loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-slate-200 dark:border-gray-700 overflow-hidden">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : myBatches?.length > 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
<div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                <div className="col-span-5">Batch</div>
                <div className="col-span-2 text-center">Assignments</div>
                <div className="col-span-2 text-center">Completed</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-1"></div>
              </div>
            </div>
<div className="divide-y divide-gray-100 dark:divide-gray-700">
              {myBatches.map((batch, index) => {
                const total =
                  assignmentCounts[String(batch.id)] ??
                  batch.assignmentCount ??
                  0;
                const completed = completedCounts[String(batch.id)] ?? 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div
                    key={batch.id || index}
                    className="px-6 py-5 hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                    onClick={() =>
                      navigate(`/student/batches/${batch.batchId || batch.id}`)
                    }
                  >
                  <div className="grid grid-cols-12 gap-4 items-center">
<div className="col-span-5 flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-1 truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                              {batch.batchName || batch.name || 'Batch Name'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {batch.batchCode || 'BATCH-CODE'}
                            </p>
                          </div>
                      </div>
<div className="col-span-2 text-center">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-md">
                          <FileText className="w-4 h-4 text-slate-700 dark:text-gray-300" />
                          <span className="font-semibold text-slate-900 dark:text-gray-100">
                            {total}
                          </span>
                        </div>
                      </div>
<div className="col-span-2 text-center">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-md">
                          <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-gray-300" />
                          <span className="font-semibold text-slate-900 dark:text-gray-100">
                            {completed}
                          </span>
                        </div>
                      </div>
<div className="col-span-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                              {progress}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-900 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
<div className="col-span-1 flex justify-end">
                        <ArrowRight className="w-5 h-5 text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Batches Enrolled Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start your learning journey by enrolling in a batch
            </p>
            <button
              onClick={() => navigate('/student/batches/available')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Browse Available Batches
            </button>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default MyBatches;

