import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';

const SubmissionList = ({
  submissions = [],
  type = 'text',
  onEvaluate,
  onViewResult,
  onDownload,
}) => {
  if (!submissions.length) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600 dark:text-gray-300">No submissions yet.</p>
      </Card>
    );
  }

  const showActions = Boolean(onEvaluate || onViewResult || onDownload);

  const getStudentName = (submission) => {
    const fullName = [
      submission.studentFirstName,
      submission.studentLastName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      fullName ||
      submission.studentName ||
      submission.name ||
      submission.studentEmail?.split('@')[0] ||
      'Student'
    );
  };

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-3 pr-6 font-medium">Student</th>
              {type === 'file' && <th className="py-3 pr-6 font-medium">File</th>}
              <th className="py-3 pr-6 font-medium">Score</th>
              <th className="py-3 pr-6 font-medium">Status</th>
              <th className="py-3 pr-6 font-medium">Submitted</th>
              {showActions && <th className="py-3 pr-6 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, index) => (
              <tr
                key={
                  s.id ??
                  `${s.studentId ?? 'student'}-${s.submittedAt ?? 'submitted'}-${index}`
                }
                className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <td className="py-3 pr-6">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {getStudentName(s)}
                  </div>
                  {s.studentEmail && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {s.studentEmail}
                    </div>
                  )}
                </td>
                {type === 'file' && (
                  <td className="py-3 pr-6 text-gray-700 dark:text-gray-200">
                    {s.fileName || '-'}
                  </td>
                )}
                <td className="py-3 pr-6 text-gray-900 dark:text-gray-100">
                  {typeof s.score === 'number' && typeof s.maxMarks === 'number'
                    ? `${s.score}/${s.maxMarks}`
                    : s.score ?? s.marksAwarded ?? s.obtainedMarks ?? 'N/A'}
                </td>
                <td className="py-3 pr-6">
                  <Badge
                    variant={
                      s.status === 'EVALUATED' || s.status === 'GRADED'
                        ? 'published'
                        : s.status === 'PENDING'
                          ? 'draft'
                          : 'default'
                    }
                  >
                    {s.status || 'SUBMITTED'}
                  </Badge>
                </td>
                <td className="py-3 pr-6 text-gray-600 dark:text-gray-300">
                  {formatDateTime(s.submittedAt)}
                </td>
                {showActions && (
                  <td className="py-3 pr-6">
                    {type === 'text' && onEvaluate ? (
                      <button
                        type="button"
                        onClick={() => onEvaluate(s)}
                        className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium"
                      >
                        Evaluate
                      </button>
                    ) : type === 'file' ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onDownload?.(s)}
                          className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-medium"
                        >
                          Download
                        </button>
                        <button
                          type="button"
                          onClick={() => onEvaluate?.(s)}
                          className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium"
                        >
                          Evaluate
                        </button>
                      </div>
                    ) : type === 'mcq' && onViewResult ? (
                      <button
                        type="button"
                        onClick={() => onViewResult(s)}
                        className="text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-200 font-medium"
                      >
                        View Result
                      </button>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default SubmissionList;
