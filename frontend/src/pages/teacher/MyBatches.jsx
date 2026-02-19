import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import BatchCard from '../../components/teacher/BatchCard';
import { fetchTeacherBatches } from '../../features/batch/batchSlice';
import { assignmentAPI } from '../../api/assignment.api';
import { batchAPI } from '../../api/batch.api';

const MyBatches = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { batches, loading } = useSelector((state) => state.batch);
  const [search, setSearch] = useState('');
  const [assignmentCounts, setAssignmentCounts] = useState({});
  const [studentCounts, setStudentCounts] = useState({});

  useEffect(() => {
    dispatch(fetchTeacherBatches());
  }, [dispatch]);

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const assignmentsRes = await assignmentAPI.getMyAssignments({ page: 0, size: 1000 });
        const assignments = assignmentsRes?.data?.data?.content || [];
        const counts = assignments.reduce((acc, a) => {
          const key = String(a.batchId);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        setAssignmentCounts(counts);
      } catch (e) {
        setAssignmentCounts({});
      }

      try {
        const details = await Promise.all(
          (batches || []).map((b) =>
            batchAPI
              .getBatchDetails(b.id)
              .then((res) => res?.data?.data || res?.data || null)
              .catch(() => null)
          )
        );
        const counts = {};
        details.forEach((d) => {
          if (d?.id != null) {
            counts[String(d.id)] = d.studentCount ?? d.totalStudents ?? 0;
          }
        });
        setStudentCounts(counts);
      } catch (e) {
        setStudentCounts({});
      }
    };

    if ((batches || []).length > 0) {
      loadCounts();
    }
  }, [batches]);

  const filteredBatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return batches || [];
    return (batches || []).filter((b) =>
      [b.name, b.batchCode].some((val) =>
        String(val || '').toLowerCase().includes(q)
      )
    );
  }, [batches, search]);

  return (
    <Layout>
      <div className="space-y-8">
<div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Batches</h1>
            <p className="text-gray-600 mt-1">
              Create assignments for your assigned batches
            </p>
          </div>
          <Button icon={Plus} onClick={() => navigate('/teacher/batches')}>
            Create Assignment
          </Button>
        </div>
<Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by batch name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
{loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={{
                  ...batch,
                  assignmentCount:
                    assignmentCounts[String(batch.id)] ?? batch.assignmentCount,
                  studentCount:
                    studentCounts[String(batch.id)] ??
                    batch.studentCount ??
                    batch.totalStudents,
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-600">
              No batches assigned yet.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MyBatches;

