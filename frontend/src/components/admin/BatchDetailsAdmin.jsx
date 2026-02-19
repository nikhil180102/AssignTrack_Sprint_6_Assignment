import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  UserPlus,
  UserMinus,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { adminAPI } from '../../api/admin.api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatters';

const BatchDetailsAdmin = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [contents, setContents] = useState([]);

  useEffect(() => {
    loadBatchDetails();
    loadAvailableTeachers();
  }, [batchId]);

  const loadBatchDetails = async () => {
    try {
      const [batchResponse, teachersResponse] = await Promise.all([
        adminAPI.getBatchDetails(batchId),
        adminAPI.getBatchTeachers(batchId),
      ]);

      setBatch(batchResponse.data.data);
      const batchTeachers = teachersResponse.data.data || [];
      const approved = (await adminAPI.getApprovedTeachers()).data.data || [];
      const enriched = batchTeachers.map((t) => {
        const profile = approved.find((a) => Number(a.id) === Number(t.teacherId));
        return { ...t, ...(profile || {}) };
      });
      setTeachers(enriched);
      const contentsRes = await adminAPI.getBatchContents(batchId);
      setContents(contentsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load batch details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTeachers = async () => {
    try {
      const response = await adminAPI.getApprovedTeachers();
      setAvailableTeachers(response.data.data || []);
    } catch (error) {
      console.error('Failed to load instructors:', error);
    }
  };

  const handleAddTeacher = async () => {
    if (!selectedTeacher) {
      toast.error('Please select an instructor');
      return;
    }

    try {
      await adminAPI.assignTeacherToBatch(batchId, parseInt(selectedTeacher));
      toast.success('Instructor assigned successfully');
      setShowAddTeacherModal(false);
      setSelectedTeacher('');
      loadBatchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign instructor');
    }
  };

  const handleRemoveTeacher = (teacherId) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">
            Remove this instructor from the batch?
          </span>
          <button
            className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await adminAPI.removeTeacherFromBatch(batchId, teacherId);
                toast.success('Instructor removed successfully');
                loadBatchDetails();
              } catch (error) {
                toast.error('Failed to remove instructor');
              }
            }}
          >
            Remove
          </button>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const getTeacherName = (teacher) => {
    const fullName = [
      teacher.firstName,
      teacher.lastName,
      teacher.first_name,
      teacher.last_name,
    ]
      .filter(Boolean)
      .join(' ');
    return (
      fullName ||
      teacher.name ||
      teacher.fullName ||
      teacher.teacherName ||
      teacher.email?.split('@')[0] ||
      'Instructor'
    );
  };

  const handleRemoveContent = async (contentId) => {
    try {
      await adminAPI.removeBatchContent(batchId, contentId);
      toast.success('Course link removed');
      loadBatchDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove course link');
    }
  };

  const handleDownloadCertification = async (teacherId, fileName) => {
    try {
      const response = await adminAPI.downloadTeacherCertification(teacherId);
      const blob = new Blob([response.data]);
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

  const getTeacherEmail = (teacher) => {
    return teacher.email || teacher.teacherEmail || '';
  };

  const filteredTeachers = teachers.filter((teacher) =>
    getTeacherName(teacher).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status) => {
    const variants = {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      CLOSED: 'closed',
    };
    return variants[status] || 'default';
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
<div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/batches')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {batch?.name}
                </h1>
                <Badge variant={getStatusVariant(batch?.status)}>
                  {batch?.status}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1 font-mono bg-gray-50 px-3 py-1 rounded inline-block">
                {batch?.batchCode}
              </p>
            </div>
          </div>
          <Button icon={UserPlus} onClick={() => setShowAddTeacherModal(true)}>
            Assign Instructor
          </Button>
        </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(batch?.startDate)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assigned Instructors</p>
                <p className="text-lg font-semibold text-gray-900">
                  {teachers.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-lg font-semibold text-gray-900">
                  {batch?.studentCount || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>
<div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Assigned Instructors</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Input
                  placeholder="Search instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
              <Button
                icon={UserPlus}
                variant="outline"
                onClick={() => setShowAddTeacherModal(true)}
              >
                Add Instructor
              </Button>
            </div>
          </div>

          {teachers.length > 0 ? (
            <div className="space-y-4">
              {filteredTeachers.map((assignment) => (
                <Card key={assignment.id || assignment.teacherId} hover className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {getTeacherName(assignment).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {getTeacherName(assignment)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {getTeacherEmail(assignment) || 'Assigned Instructor'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Expertise: {assignment.expertise || 'NA'} | Experience: {assignment.experienceYears ?? 'NA'} yrs
                        </p>
                        <button
                          type="button"
                          onClick={() => handleDownloadCertification(assignment.teacherId || assignment.id, assignment.certificationFileName)}
                          className="text-xs text-indigo-700 hover:text-indigo-900 mt-1"
                        >
                          {assignment.certificationFileName ? `Certification: ${assignment.certificationFileName}` : 'No certification uploaded'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Assigned: {formatDate(new Date())}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={UserMinus}
                        className="border-red-500 text-red-700 hover:bg-red-50 focus:ring-red-500"
                        onClick={() => handleRemoveTeacher(assignment.teacherId)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No instructors assigned yet</p>
              <Button onClick={() => setShowAddTeacherModal(true)}>
                Assign First Instructor
              </Button>
            </Card>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Course Links</h2>
          </div>

          {contents.length > 0 ? (
            <div className="space-y-2 mb-8">
              {contents.map((c) => (
                <Card key={c.id} className="p-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{c.title}</p>
                      <a
                        className="text-sm text-indigo-700 hover:text-indigo-900 break-all"
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {c.url}
                      </a>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveContent(c.id)}>
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4 mb-8">
              <p className="text-sm text-gray-600">No course links added yet.</p>
            </Card>
          )}

          <Button
            variant="outline"
            onClick={() => navigate('/admin/batches')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Batches
          </Button>
        </div>
      </div>
<Modal
        isOpen={showAddTeacherModal}
        onClose={() => {
          setShowAddTeacherModal(false);
          setSelectedTeacher('');
        }}
        title="Assign Instructor to Batch"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Instructor *
            </label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Choose an instructor...</option>
              {availableTeachers
                .filter(
                  (teacher) =>
                    !teachers.some((t) => t.teacherId === teacher.id)
                )
                .map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {getTeacherName(teacher)} - {teacher.expertise || 'NA'} - {teacher.experienceYears ?? 'NA'} yrs
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Only approved instructors are shown
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Assignment Details</p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Instructor will get instant access to this batch</li>
                  <li>• They can create and manage assignments</li>
                  <li>• Email notification will be sent</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddTeacherModal(false);
                setSelectedTeacher('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTeacher}>Assign Instructor</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default BatchDetailsAdmin;

