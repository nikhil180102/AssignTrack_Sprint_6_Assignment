import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  Plus,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import BatchCard from '../../components/admin/BatchCard';
import {
  fetchPendingTeachers,
  fetchAllBatches,
} from '../../features/admin/adminSlice';
import { adminAPI } from '../../api/admin.api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { teachers, batches } = useSelector((state) => state.admin);
  const [approvedTeachersCount, setApprovedTeachersCount] = useState(0);
  const [batchTeacherCounts, setBatchTeacherCounts] = useState({});
  const [batchStudentCounts, setBatchStudentCounts] = useState({});

  useEffect(() => {
    dispatch(fetchPendingTeachers());
    dispatch(fetchAllBatches());
  }, [dispatch]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await adminAPI.getApprovedTeachers();
        setApprovedTeachersCount(res.data.data?.length || 0);
      } catch (err) {
        setApprovedTeachersCount(0);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadBatchCounts = async () => {
      try {
        const details = await Promise.all(
          (batches.list || []).map((b) =>
            adminAPI
              .getBatchDetails(b.id)
              .then((res) => res?.data?.data || res?.data || null)
              .catch(() => null)
          )
        );
        const counts = {};
        const teacherCounts = {};
        details.forEach((d) => {
          if (d?.id != null) {
            counts[String(d.id)] = d.studentCount ?? 0;
            teacherCounts[String(d.id)] = d.teacherCount ?? 0;
          }
        });
        setBatchStudentCounts(counts);
        setBatchTeacherCounts(teacherCounts);
      } catch (e) {
        setBatchStudentCounts({});
        setBatchTeacherCounts({});
      }
    };

    if ((batches.list || []).length > 0) {
      loadBatchCounts();
    }
  }, [batches.list]);

  const stats = [
    {
      icon: Clock,
      label: 'Pending Approvals',
      value: teachers.pending?.length || 0,
      color: 'bg-yellow-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-yellow-50',
      action: () => navigate('/admin/teachers'),
    },
    {
      icon: BookOpen,
      label: 'Total Batches',
      value: batches.list?.length || 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => navigate('/admin/batches'),
    },
    {
      icon: UserCheck,
      label: 'Active Instructors',
      value: approvedTeachersCount,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      action: () => navigate('/admin/teachers?status=APPROVED'),
    },
    {
      icon: Users,
      label: 'Total Students',
      value: Object.values(batchStudentCounts).reduce((acc, c) => acc + (c || 0), 0),
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
<div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage instructors, batches, and monitor system activity
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/teachers')}
            >
              Manage Instructors
            </Button>
            <Button icon={Plus} onClick={() => navigate('/admin/batches')}>
              Create Batch
            </Button>
          </div>
        </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 cursor-pointer"
              hover
              onClick={stat.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>
<div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Recent Batches</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/batches')}
            >
              View All
            </Button>
          </div>

          {batches.loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : batches.list?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batches.list.slice(0, 3).map((batch) => (
                <BatchCard
                  key={batch.id}
                  batch={{
                    ...batch,
                    teacherCount:
                      batchTeacherCounts[String(batch.id)] ?? batch.teacherCount ?? 0,
                    studentCount:
                      batchStudentCounts[String(batch.id)] ?? batch.studentCount ?? 0,
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No batches created yet</p>
              <Button onClick={() => navigate('/admin/batches')}>
                Create Your First Batch
              </Button>
            </Card>
          )}
        </div>
<Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            System Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {batches.list?.filter((b) => b.status === 'PUBLISHED').length || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Draft Batches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {batches.list?.filter((b) => b.status === 'DRAFT').length || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <UserX className="w-6 h-6 text-red-700 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Closed Batches</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {batches.list?.filter((b) => b.status === 'CLOSED').length || 0}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

