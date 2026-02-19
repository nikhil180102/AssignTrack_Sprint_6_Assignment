import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AssignmentCard from '../../components/teacher/AssignmentCard';
import Pagination from '../../components/common/Pagination';
import {
  fetchMyAssignments,
  setSearchFilter,
  setTypeFilter,
  setStatusFilter,
  clearFilters,
} from '../../features/assignment/assignmentSlice';

const MyAssignments = () => {
  const PAGE_SIZE = 6;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignments, loading, filters, pagination } = useSelector(
    (state) => state.assignment
  );
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(
      fetchMyAssignments({
        page: currentPage - 1,
        size: PAGE_SIZE,
        search: filters.search || undefined,
        type: filters.type !== 'all' ? filters.type : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
      })
    );
  }, [dispatch, currentPage, filters.search, filters.type, filters.status]);

  const currentAssignments = useMemo(() => assignments || [], [assignments]);

  const groupedAssignments = {
    DRAFT: currentAssignments.filter((a) => a.status === 'DRAFT'),
    PUBLISHED: currentAssignments.filter((a) => a.status === 'PUBLISHED'),
    CLOSED: currentAssignments.filter((a) => a.status === 'CLOSED'),
  };

  const assignmentsByBatch = useMemo(() => {
    return currentAssignments.reduce((acc, assignment) => {
      const batchLabel =
        assignment.batchCode ||
        assignment.batchName ||
        `BATCH-${assignment.batchId ?? 'N/A'}`;
      if (!acc[batchLabel]) acc[batchLabel] = [];
      acc[batchLabel].push(assignment);
      return acc;
    }, {});
  }, [currentAssignments]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600 mt-1">Manage and track all your assignments</p>
          </div>
          <Button icon={Plus} onClick={() => navigate('/teacher/batches')}>
            Create Assignment
          </Button>
        </div>

        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search assignments..."
                  value={filters.search}
                  onChange={(e) => {
                    setCurrentPage(1);
                    dispatch(setSearchFilter(e.target.value));
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={filters.type}
              onChange={(e) => {
                setCurrentPage(1);
                dispatch(setTypeFilter(e.target.value));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="TEXT">Text</option>
              <option value="MCQ">MCQ</option>
              <option value="FILE">File</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => {
                setCurrentPage(1);
                dispatch(setStatusFilter(e.target.value));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>

            {(filters.search || filters.type !== 'all' || filters.status !== 'all') && (
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentPage(1);
                  dispatch(clearFilters());
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-3xl font-bold text-gray-900">{pagination.totalElements || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Draft (Page)</p>
            <p className="text-3xl font-bold text-gray-900">{groupedAssignments.DRAFT.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Published (Page)</p>
            <p className="text-3xl font-bold text-green-700">
              {groupedAssignments.PUBLISHED.length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600 mb-1">Closed (Page)</p>
            <p className="text-3xl font-bold text-red-700">{groupedAssignments.CLOSED.length}</p>
          </Card>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-6" />
                <div className="h-10 bg-gray-200 rounded" />
              </Card>
            ))}
          </div>
        ) : currentAssignments.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(assignmentsByBatch).map(([batchLabel, batchAssignments]) => (
              <div key={batchLabel} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {batchLabel}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {batchAssignments.length} assignment
                    {batchAssignments.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {batchAssignments.map((assignment) => (
                    <AssignmentCard key={assignment.assignmentId} assignment={assignment} />
                  ))}
                </div>
              </div>
            ))}
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
          <Card className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              {filters.search || filters.type !== 'all' || filters.status !== 'all' ? (
                <>
                  <Filter className="w-12 h-12 mx-auto mb-4" />
                  <p>No assignments match your filters</p>
                </>
              ) : (
                <>
                  <Plus className="w-12 h-12 mx-auto mb-4" />
                  <p className="mb-4">No assignments created yet</p>
                  <Button onClick={() => navigate('/teacher/batches')}>
                    Create Your First Assignment
                  </Button>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MyAssignments;

