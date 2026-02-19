import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  FileQuestion,
  Paperclip,
  CheckCircle2,
  Clock,
  Award,
  Filter,
  PlayCircle,
  Eye,
  Link as LinkIcon,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentAPI } from '../../api/student.api';
import toast from 'react-hot-toast';
import { getSubmittedIds } from '../../utils/submissionStatus';
import { getUserId } from '../../utils/auth';

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [batch, setBatch] = useState(null);
  const [contents, setContents] = useState([]);
  const userId = getUserId();

  useEffect(() => {
    loadAssignments();
  }, [batchId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, myBatchesRes] = await Promise.all([
        studentAPI.getAllAssignments(),
        studentAPI.getMyBatches(),
      ]);
      const allAssignments = assignmentsRes.data.data || [];
      const submittedIds = getSubmittedIds(userId);
      setAssignments(
        allAssignments
          .filter((a) => String(a.batchId) === String(batchId))
          .map((a) => ({
            ...a,
            submitted: a.submitted === true || submittedIds.has(Number(a.assignmentId)),
          }))
      );
      const myBatches = myBatchesRes.data.data || [];
      const matchedBatch = myBatches.find(
        (b) => String(b.id) === String(batchId)
      );
      setBatch(matchedBatch || null);
      const contentsRes = await studentAPI.getBatchContents(batchId);
      setContents(contentsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleContentCompletion = async (content) => {
    try {
      if (content.completed) {
        await studentAPI.markContentIncomplete(batchId, content.id);
      } else {
        await studentAPI.markContentComplete(batchId, content.id);
      }
      setContents((prev) =>
        prev.map((c) =>
          c.id === content.id ? { ...c, completed: !c.completed } : c
        )
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update content progress');
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === 'pending') return !assignment.submitted;
    if (filter === 'completed') return assignment.submitted;
    return true;
  });

  const getTypeIcon = (type) => {
    if (type === 'MCQ') return FileQuestion;
    if (type === 'FILE') return Paperclip;
    return FileText;
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
<div>
          <button
            onClick={() => navigate('/student/batches')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to My Batches</span>
          </button>

          <div className="bg-slate-900 rounded-2xl p-6 text-white">
            <h1 className="text-2xl font-bold mb-1">
              {batch?.name || 'Batch Details'}
            </h1>
            <p className="text-slate-200 text-sm font-mono">
              {batch?.batchCode || '—'}
            </p>
          </div>
        </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{assignments.length}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {assignments.filter((a) => !a.submitted).length}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center space-x-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-700" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {assignments.filter((a) => a.submitted).length}
            </p>
          </div>

        </div>
<div className="flex items-center space-x-3">
          {[
            { value: 'all', label: 'All Assignments' },
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

        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Course Links</h2>
          {contents.length > 0 ? (
            <div className="space-y-2">
              {contents.map((content) => (
                <div key={content.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{content.title}</p>
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-indigo-700 hover:text-indigo-900 flex items-center gap-1 mt-1"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Open Content
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleContentCompletion(content)}
                    className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                      content.completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-900 text-white'
                    }`}
                  >
                    {content.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border border-slate-200 text-sm text-slate-600">
              No course links available for this batch.
            </div>
          )}
        </div>
{loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
          <div className="space-y-3">
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
                    if (assignment.submitted && type === 'text') {
                      toast('Assignment already submitted');
                      return;
                    }
                    navigate(`/student/assignments/${type}/${assignment.assignmentId}`);
                  }}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-sm transition-all cursor-pointer group"
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
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            assignment.submitted
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {assignment.submitted ? 'Submitted' : 'Pending'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                        {assignment.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4" />
                          <span>{assignment.maxMarks} marks</span>
                        </div>
                        {assignment.submitted && assignment.score !== undefined && (
                          <div className="flex items-center space-x-2 text-green-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Score: {assignment.score}/{assignment.maxMarks}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
<button className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all flex items-center space-x-2">
                    {assignment.submitted ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <PlayCircle className="w-5 h-5" />
                    )}
                    <span>{assignment.submitted ? 'View' : 'Start'}</span>
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Filter className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Assignments Found
            </h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'No assignments available for this batch yet'
                : `No ${filter} assignments`}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default BatchDetails;

