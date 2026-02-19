import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Award,
  Filter,
  PlayCircle,
  Eye,
  FileQuestion,
  FileText,
  Paperclip,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentAPI } from '../../api/student.api';
import toast from 'react-hot-toast';
import { getSubmittedIds } from '../../utils/submissionStatus';
import { getUserId } from '../../utils/auth';
import Modal from '../../components/common/Modal';

const AllAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const userId = getUserId();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAllAssignments();
      const list = response.data.data || [];
      const submittedIds = getSubmittedIds(userId);
      setAssignments(
        list.map((a) => ({
          ...a,
          submitted: a.submitted === true || submittedIds.has(Number(a.assignmentId)),
        }))
      );
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const submitted = !!assignment.submitted;
    const statusMatch =
      filter === 'all' ||
      (filter === 'pending' && !submitted) ||
      (filter === 'completed' && submitted);

    const typeMatch =
      typeFilter === 'all' || assignment.type === typeFilter;

    return statusMatch && typeMatch;
  });

  const getTypeIcon = (type) => {
    if (type === 'MCQ') return FileQuestion;
    if (type === 'FILE') return Paperclip;
    return FileText;
  };

  const openFeedback = (assignment) => {
    setSelectedAssignment(assignment);
  };

  const stats = [
    {
      label: 'Total',
      value: assignments.length,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Pending',
      value: assignments.filter((a) => !a.submitted).length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Completed',
      value: assignments.filter((a) => a.submitted).length,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
<div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            All Assignments
          </h1>
          <p className="text-slate-600">
            Complete your assignments and track your progress
          </p>
        </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-slate-200"
            >
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>
<div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700">Status:</span>
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  filter === f.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-700">Type:</span>
            {[
              { value: 'all', label: 'All Types' },
              { value: 'TEXT', label: 'Text' },
              { value: 'MCQ', label: 'MCQ' },
              { value: 'FILE', label: 'File' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  typeFilter === f.value
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
{loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredAssignments.map((assignment) => {
                const TypeIcon = getTypeIcon(assignment.type);
                return (
                <div
                  key={assignment.assignmentId}
                  onClick={() => {
                    const type = assignment.type?.toLowerCase();
                    if (assignment.submitted && type === 'mcq') {
                      navigate(`/student/assignments/mcq/${assignment.assignmentId}/result`);
                      return;
                    }
                    if (assignment.submitted && (type === 'text' || type === 'file')) {
                      if (assignment.obtainedMarks != null || assignment.feedback) {
                        openFeedback(assignment);
                        return;
                      }
                      toast('Submitted. Waiting for evaluation.', { icon: 'i' });
                      return;
                    }
                    navigate(`/student/assignments/${type}/${assignment.assignmentId}`);
                  }}
                  className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors truncate">
                            {assignment.title}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                              assignment.submitted
                                ? assignment.obtainedMarks != null
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {assignment.submitted
                              ? assignment.obtainedMarks != null
                                ? 'Evaluated'
                                : 'Submitted'
                              : 'Pending'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-6 text-sm text-slate-600">
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{assignment.maxMarks} marks</span>
                          </div>
                          {assignment.submitted && assignment.obtainedMarks != null && (
                            <div className="flex items-center space-x-1 text-green-700 font-semibold dark:text-green-300">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>
                                Score: {assignment.obtainedMarks}/{assignment.maxMarks}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all flex items-center space-x-2">
                      {assignment.submitted ? (
                        <>
                          <Eye className="w-5 h-5" />
                          <span>
                            {assignment.type === 'MCQ'
                              ? 'View Result'
                              : assignment.obtainedMarks != null || assignment.feedback
                              ? 'View Feedback'
                              : 'Submitted'}
                          </span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-5 h-5" />
                          <span>Start</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600">
              No assignments match your current filters
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignment(null)}
        title="Assignment Feedback"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Assignment</p>
            <p className="text-lg font-semibold text-slate-900">
              {selectedAssignment?.title}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Score</p>
              <p className="text-xl font-bold text-slate-900">
                {selectedAssignment?.obtainedMarks ?? '—'} / {selectedAssignment?.maxMarks ?? '—'}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <p className="text-sm font-semibold text-slate-900">
                {selectedAssignment?.obtainedMarks != null ? 'Evaluated' : 'Submitted'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-2">Feedback</p>
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 whitespace-pre-wrap min-h-[80px]">
              {selectedAssignment?.feedback || 'No feedback yet.'}
            </div>
          </div>
        </div>
      </Modal>
    </StudentLayout>
  );
};

export default AllAssignments;

