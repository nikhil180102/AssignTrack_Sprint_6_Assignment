import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Search, BookOpen } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import BatchCard from '../../components/admin/BatchCard';
import CreateBatchModal from '../../components/admin/CreateBatchModal';
import { fetchAllBatches } from '../../features/admin/adminSlice';
import { adminAPI } from '../../api/admin.api';

const BatchManagement = () => {
  const dispatch = useDispatch();
  const { batches } = useSelector((state) => state.admin);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countsByBatch, setCountsByBatch] = useState({});

  useEffect(() => {
    dispatch(fetchAllBatches());
  }, [dispatch]);

  useEffect(() => {
    const loadCounts = async () => {
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
        details.forEach((d) => {
          if (d?.id != null) {
            counts[String(d.id)] = {
              teacherCount: d.teacherCount ?? 0,
              studentCount: d.studentCount ?? 0,
            };
          }
        });
        setCountsByBatch(counts);
      } catch (e) {
        setCountsByBatch({});
      }
    };

    if ((batches.list || []).length > 0) {
      loadCounts();
    }
  }, [batches.list]);

  const filteredBatches = batches.list?.filter((batch) => {
    const matchesSearch =
      batch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.batchCode?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Batches',
      value: batches.list?.length || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Draft',
      value: batches.list?.filter((b) => b.status === 'DRAFT').length || 0,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      label: 'Published',
      value: batches.list?.filter((b) => b.status === 'PUBLISHED').length || 0,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Closed',
      value: batches.list?.filter((b) => b.status === 'CLOSED').length || 0,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
    },
  ];

  const handleBatchCreated = () => {
    dispatch(fetchAllBatches());
  };

  return (
    <Layout>
      <div className="space-y-8">
<div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
            <p className="text-gray-600 mt-1">
              Create and manage learning batches
            </p>
          </div>
          <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
            Create Batch
          </Button>
        </div>
<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>
<Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </Card>
{batches.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredBatches?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBatches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={{
                  ...batch,
                  teacherCount:
                    countsByBatch[String(batch.id)]?.teacherCount ??
                    batch.teacherCount,
                  studentCount:
                    countsByBatch[String(batch.id)]?.studentCount ??
                    batch.studentCount,
                }}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? 'No batches found matching your filters'
                : 'No batches created yet'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Batch
              </Button>
            )}
          </Card>
        )}
      </div>
<Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Batch"
        size="md"
      >
        <CreateBatchModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleBatchCreated}
        />
      </Modal>
    </Layout>
  );
};

export default BatchManagement;

