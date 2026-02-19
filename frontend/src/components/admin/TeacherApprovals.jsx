import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, UserCheck, UserX, Clock, Filter, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { fetchPendingTeachers, approveTeacher, rejectTeacher } from '../../features/admin/adminSlice';
import { adminAPI } from '../../api/admin.api';
import { format, isValid } from 'date-fns';

const TeacherApprovals = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { teachers } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [rejectedTeachers, setRejectedTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const statusFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    return status ? status.toUpperCase() : null;
  }, [location.search]);

  useEffect(() => {
    if (statusFromQuery && ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFromQuery)) {
      setActiveTab(statusFromQuery);
    }
  }, [statusFromQuery]);

  useEffect(() => {
    loadTeachers();
  }, [activeTab]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      if (activeTab === 'PENDING') {
        dispatch(fetchPendingTeachers());
      } else if (activeTab === 'APPROVED') {
        const response = await adminAPI.getApprovedTeachers();
        setApprovedTeachers(response.data.data || []);
      } else if (activeTab === 'REJECTED') {
        const response = await adminAPI.getRejectedTeachers();
        setRejectedTeachers(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'PENDING',
      label: 'Pending',
      icon: Clock,
      count: teachers.pending?.length || 0,
      color: 'text-amber-700',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'APPROVED',
      label: 'Approved',
      icon: UserCheck,
      count: approvedTeachers.length,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
    },
    {
      id: 'REJECTED',
      label: 'Rejected',
      icon: UserX,
      count: rejectedTeachers.length,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
    },
  ];

  const getCurrentTeachers = () => {
    let currentList = [];
    if (activeTab === 'PENDING') currentList = teachers.pending || [];
    else if (activeTab === 'APPROVED') currentList = approvedTeachers;
    else if (activeTab === 'REJECTED') currentList = rejectedTeachers;

    return currentList.filter((teacher) =>
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredTeachers = getCurrentTeachers();

  const getTeacherName = (teacher) =>
    [
      teacher.firstName,
      teacher.lastName,
      teacher.first_name,
      teacher.last_name,
    ]
      .filter(Boolean)
      .join(' ') ||
    teacher.name ||
    teacher.fullName ||
    teacher.email?.split('@')[0] ||
    'Instructor';

  const getRegisteredDate = (teacher) => {
    const rawDate = teacher.createdAt || teacher.created_at || teacher.updatedAt || null;
    if (!rawDate) return null;
    const parsed = new Date(rawDate);
    return isValid(parsed) ? format(parsed, 'MMM dd, yyyy') : null;
  };

  const handleApprove = async (teacherId) => {
    setActionLoadingId(teacherId);
    try {
      await dispatch(approveTeacher(teacherId));
      if (activeTab !== 'PENDING') {
        await loadTeachers();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (teacherId) => {
    setActionLoadingId(teacherId);
    try {
      await dispatch(rejectTeacher(teacherId));
      if (activeTab !== 'PENDING') {
        await loadTeachers();
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownloadCertification = async (teacherId, fileName) => {
    try {
      const response = await adminAPI.downloadTeacherCertification(teacherId);
      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `teacher-${teacherId}-certification`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download certification');
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
<div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
          <p className="text-gray-600 mt-1">
            Approve, reject, and manage instructor accounts
          </p>
        </div>
<div className="flex space-x-2 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                <Badge
                  variant={activeTab === tab.id ? 'primary' : 'default'}
                  size="sm"
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </div>
<Card className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search instructors by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${tabs.find(t => t.id === activeTab)?.bgColor}`}>
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon, {
                  className: `w-6 h-6 ${tabs.find(t => t.id === activeTab)?.color}`
                })}
              </div>
              <div>
                <p className="text-sm text-gray-600">Total {activeTab.toLowerCase()}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {tabs.find(t => t.id === activeTab)?.count}
                </p>
              </div>
            </div>
          </Card>
        </div>
{loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : filteredTeachers.length > 0 ? (
          <div className="space-y-3">
            {filteredTeachers.map((teacher) => {
              const displayName = getTeacherName(teacher);
              const registeredDate = getRegisteredDate(teacher);
              const teacherId = teacher.id;
              return (
                <Card key={teacherId} className="p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{teacher.email || '-'}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          Expertise: {teacher.expertise || 'NA'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          Experience: {teacher.experienceYears ?? 'NA'} yrs
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100">
                          Certification: {teacher.certificationFileName || 'NA'}
                        </span>
                      </div>
                      {registeredDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Registered: {registeredDate}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          activeTab === 'APPROVED'
                            ? 'success'
                            : activeTab === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {activeTab}
                      </Badge>
                      {teacher.certificationFileName && (
                        <Button
                          size="sm"
                          variant="outline"
                          icon={Download}
                          onClick={() =>
                            handleDownloadCertification(
                              teacherId,
                              teacher.certificationFileName
                            )
                          }
                        >
                          Certification
                        </Button>
                      )}
                      {activeTab === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(teacherId)}
                            disabled={actionLoadingId === teacherId}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(teacherId)}
                            disabled={actionLoadingId === teacherId}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Filter className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchQuery
                ? 'No instructors found matching your search'
                : `No ${activeTab.toLowerCase()} instructors`}
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TeacherApprovals;

