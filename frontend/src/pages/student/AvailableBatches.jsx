import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  BookOpen,
  Users,
  Calendar,
  Search,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import {
  fetchAvailableBatches,
  fetchMyBatches,
  enrollInBatch,
} from '../../features/student/studentSlice';
import { format } from 'date-fns';

const AvailableBatches = () => {
  const dispatch = useDispatch();
  const { availableBatches, myBatches, loading, enrolling } = useSelector(
    (state) => state.student
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [enrollingBatchId, setEnrollingBatchId] = useState(null);

  const enrolledBatchIds = useMemo(
    () => new Set((Array.isArray(myBatches) ? myBatches : []).map((b) => String(b.id))),
    [myBatches]
  );

  useEffect(() => {
    dispatch(fetchAvailableBatches());
    dispatch(fetchMyBatches());
  }, [dispatch]);

  const handleEnroll = async (batchId) => {
    setEnrollingBatchId(batchId);
    const result = await dispatch(enrollInBatch(batchId));
    setEnrollingBatchId(null);
    if (enrollInBatch.fulfilled.match(result)) {
      dispatch(fetchMyBatches());
    }
  };

  const filteredBatches = availableBatches?.filter((batch) =>
    batch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.batchCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-8">
<div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover Batches
          </h1>
          <p className="text-slate-600">
            Explore and enroll in exciting learning opportunities
          </p>
        </div>
<div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search batches by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all text-sm"
          />
        </div>
{loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="h-12 w-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBatches?.length > 0 ? (
          <div className="space-y-4">
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-sm transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
<div className="flex items-center space-x-6 flex-1">
<div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
<div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                          {batch.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-mono mb-3">
                        {batch.batchCode}
                      </p>
<div className="flex items-center space-x-6 text-sm text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Starts:{' '}
                            {batch.startDate
                              ? format(new Date(batch.startDate), 'MMM dd, yyyy')
                              : 'TBA'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{batch.studentCount || 0} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
{enrolledBatchIds.has(String(batch.id)) ? (
                    <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-md text-sm font-semibold flex items-center space-x-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Enrolled</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(batch.id)}
                      disabled={enrollingBatchId === batch.id}
                      className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {enrollingBatchId === batch.id ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Enrolling...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Enroll Now</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Batches Found
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'No batches available at the moment'}
            </p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default AvailableBatches;

