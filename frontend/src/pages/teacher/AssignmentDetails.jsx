import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import SubmissionList from '../../components/teacher/SubmissionList';
import { assignmentAPI } from '../../api/assignment.api';
import { userAPI } from '../../api/user.api';
import { formatDateTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AssignmentDetails = () => {
  const navigate = useNavigate();
  const { assignmentId } = useParams();
  const { assignments } = useSelector((state) => state.assignment);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showEvaluateModal, setShowEvaluateModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const assignmentFromStore = useMemo(() => {
    const idNum = Number(assignmentId);
    return (
      assignments.find((a) => a.assignmentId === idNum || a.id === idNum) ||
      null
    );
  }, [assignments, assignmentId]);

  const type = (assignmentFromStore?.type || assignment?.type || 'TEXT')
    .toString()
    .toLowerCase();

  useEffect(() => {
    let isMounted = true;

    const enrichSubmissionUsers = async (rawSubmissions) => {
      const list = Array.isArray(rawSubmissions) ? rawSubmissions : [];
      const idsToResolve = [
        ...new Set(
          list
            .filter(
              (s) =>
                s?.studentId &&
                !s?.studentName &&
                !s?.name &&
                !s?.studentEmail &&
                !s?.studentFirstName
            )
            .map((s) => Number(s.studentId))
            .filter((id) => Number.isFinite(id) && id > 0)
        ),
      ];

      if (!idsToResolve.length) {
        return list;
      }

      const resolved = await Promise.allSettled(
        idsToResolve.map((id) => userAPI.getUserById(id))
      );

      const byId = {};
      resolved.forEach((r, idx) => {
        if (r.status === 'fulfilled') {
          byId[idsToResolve[idx]] = r.value?.data?.data || null;
        }
      });

      return list.map((s) => {
        const profile = byId[Number(s.studentId)];
        if (!profile) return s;
        return {
          ...s,
          studentFirstName: s.studentFirstName || profile.firstName,
          studentLastName: s.studentLastName || profile.lastName,
          studentName:
            s.studentName ||
            s.name ||
            [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim(),
          studentEmail: s.studentEmail || profile.email,
        };
      });
    };

    const load = async () => {
      setLoading(true);
      try {
        const details = await assignmentAPI.getAssignmentDetails(
          assignmentId,
          type
        );
        const detailsData = details?.data?.data || details?.data || null;

        const subs = await assignmentAPI.getAssignmentSubmissions(
          assignmentId,
          type
        );
        const submissionsData = subs?.data?.data || subs?.data || [];
        const enrichedSubmissions = await enrichSubmissionUsers(submissionsData);

        if (isMounted) {
          setAssignment(detailsData || assignmentFromStore);
          setSubmissions(enrichedSubmissions);
        }
      } catch (err) {
        if (isMounted) {
          setAssignment(assignmentFromStore);
          setSubmissions([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [assignmentId, type, assignmentFromStore]);

  const openEvaluateModal = (submission) => {
    setSelectedSubmission(submission);
    setObtainedMarks(
      submission?.score ?? submission?.obtainedMarks ?? submission?.marksAwarded ?? ''
    );
    setFeedback(submission?.feedback || '');
    setShowEvaluateModal(true);
  };

  const openResultModal = (submission) => {
    setSelectedSubmission(submission);
    setShowResultModal(true);
  };

  const handleEvaluateSubmit = async () => {
    if (!selectedSubmission?.studentId) {
      toast.error('Student info is missing for this submission.');
      return;
    }
    if (obtainedMarks === '' || Number.isNaN(Number(obtainedMarks))) {
      toast.error('Please enter obtained marks.');
      return;
    }
    try {
      setSaving(true);
      await assignmentAPI.evaluateSubmission(
        assignmentId,
        selectedSubmission.studentId,
        {
          obtainedMarks: Number(obtainedMarks),
          feedback: feedback?.trim() || null,
        }
      );
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id
            ? {
                ...s,
                score: Number(obtainedMarks),
                status: 'EVALUATED',
                feedback: feedback?.trim() || s.feedback,
              }
            : s
        )
      );
      toast.success('Submission evaluated successfully');
      setShowEvaluateModal(false);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to evaluate submission'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadFile = async (submission) => {
    if (!submission?.studentId) {
      toast.error('Student info is missing for this submission.');
      return;
    }
    try {
      const res = await assignmentAPI.downloadSubmissionFile(
        assignmentId,
        submission.studentId
      );
      const blob = new Blob([res.data], {
        type: res.headers['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const defaultFileName = submission.fileName || `submission-${submission.studentId}`;
      anchor.download = defaultFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to download file');
    }
  };

  const getTypeIcon = () => {
    return type === 'mcq' ? CheckCircle2 : FileText;
  };

  const getStudentName = (submission) => {
    const fullName = [
      submission?.studentFirstName,
      submission?.studentLastName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      fullName ||
      submission?.studentName ||
      submission?.name ||
      submission?.studentEmail?.split('@')[0] ||
      'Student'
    );
  };

  const Icon = getTypeIcon();

  return (
    <Layout>
      <div className="space-y-8">
<div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/teacher/assignments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {assignment?.title || 'Assignment Details'}
                </h1>
                {assignment?.status && (
                  <Badge variant="published">{assignment.status}</Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                {assignment?.description}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher/assignments')}>
            Back to Assignments
          </Button>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Icon className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="text-lg font-semibold text-gray-900">
                  {assignment?.type || 'TEXT'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <FileText className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Marks</p>
                <p className="text-lg font-semibold text-gray-900">
                  {assignment?.maxMarks || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
<div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Submissions
            </h2>
          </div>

          {loading ? (
            <Card className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ) : (
            <SubmissionList
              submissions={submissions}
              type={type}
              onEvaluate={type === 'text' || type === 'file' ? openEvaluateModal : undefined}
              onViewResult={type === 'mcq' ? openResultModal : undefined}
              onDownload={type === 'file' ? handleDownloadFile : undefined}
            />
          )}
        </div>
      </div>
<Modal
        isOpen={showEvaluateModal}
        onClose={() => setShowEvaluateModal(false)}
        title="Evaluate Submission"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Student</p>
            <p className="font-medium text-gray-900">
              {getStudentName(selectedSubmission)}
            </p>
            {selectedSubmission?.studentEmail && (
              <p className="text-xs text-gray-500">{selectedSubmission.studentEmail}</p>
            )}
          </div>
          {selectedSubmission?.submissionContent && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Submission</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                {selectedSubmission.submissionContent}
              </div>
            </div>
          )}
          {type === 'file' && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Submitted File</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 flex items-center justify-between">
                <span>{selectedSubmission?.fileName || 'File'}</span>
                <Button
                  variant="outline"
                  onClick={() => handleDownloadFile(selectedSubmission)}
                >
                  Download
                </Button>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Obtained Marks
            </label>
            <Input
              type="number"
              min="0"
              value={obtainedMarks}
              onChange={(e) => setObtainedMarks(e.target.value)}
              placeholder="Enter obtained marks"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feedback (optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback for the student"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowEvaluateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEvaluateSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Submit Evaluation'}
            </Button>
          </div>
        </div>
      </Modal>
<Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="MCQ Result"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Student</p>
            <p className="font-medium text-gray-900">
              {getStudentName(selectedSubmission)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-1">Score</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedSubmission?.obtainedMarks ??
                  selectedSubmission?.score ??
                  '—'}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-500 mb-1">Total Marks</p>
              <p className="text-lg font-semibold text-gray-900">
                {selectedSubmission?.totalMarks ??
                  selectedSubmission?.maxMarks ??
                  assignment?.maxMarks ??
                  '—'}
              </p>
            </Card>
          </div>
          <Card className="p-4">
            <p className="text-xs text-gray-500 mb-1">Submitted At</p>
            <p className="text-sm text-gray-700">
              {formatDateTime(selectedSubmission?.submittedAt)}
            </p>
          </Card>
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowResultModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AssignmentDetails;

