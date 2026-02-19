import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2 } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { fetchMyAssignments } from '../../features/assignment/assignmentSlice';

const Submissions = () => {
  const PAGE_SIZE = 8;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignments, loading, pagination } = useSelector((state) => state.assignment);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchMyAssignments({
        page: currentPage - 1,
        size: PAGE_SIZE,
      })
    );
  }, [dispatch, currentPage]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Submissions</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Review student submissions and evaluate text assignments.
            </p>
          </div>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
          ) : assignments?.length ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="py-3 pr-6 font-medium">Assignment</th>
                      <th className="py-3 pr-6 font-medium">Type</th>
                      <th className="py-3 pr-6 font-medium">Status</th>
                      <th className="py-3 pr-6 font-medium">Submissions</th>
                      <th className="py-3 pr-6 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((assignment) => {
                      const type = assignment.type?.toLowerCase() || 'text';
                      const submissionsCount =
                        assignment.totalSubmissions ??
                        assignment.submissionCount ??
                        assignment.submissionsCount ??
                        '-';
                      return (
                        <tr
                          key={assignment.assignmentId || assignment.id}
                          className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <td className="py-3 pr-6">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {assignment.title}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {assignment.batchCode || assignment.batchName || `BATCH-${assignment.batchId}`}
                            </div>
                          </td>
                          <td className="py-3 pr-6">
                            <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200">
                              {type === 'mcq' ? (
                                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-blue-500" />
                              )}
                              {assignment.type || 'TEXT'}
                            </span>
                          </td>
                          <td className="py-3 pr-6 text-gray-700 dark:text-gray-200">
                            {assignment.status || 'PUBLISHED'}
                          </td>
                          <td className="py-3 pr-6 text-gray-700 dark:text-gray-200">
                            {submissionsCount}
                          </td>
                          <td className="py-3 pr-6">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/teacher/assignments/${assignment.assignmentId || assignment.id}`
                                )
                              }
                            >
                              View Submissions
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, pagination.totalPages || 1)}
                totalItems={pagination.totalElements || 0}
                pageSize={PAGE_SIZE}
                itemLabel="assignments"
                onPageChange={setCurrentPage}
              />
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600 dark:text-gray-300">
              No assignments found yet.
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Submissions;

