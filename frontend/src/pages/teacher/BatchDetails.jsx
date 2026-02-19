import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Pencil,
  Trash2
} from 'lucide-react';
import { useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import CreateTextAssignment from '../../components/teacher/CreateTextAssignment';
import CreateMcqAssignment from '../../components/teacher/CreateMcqAssignment';
import CreateFileAssignment from '../../components/teacher/CreateFileAssignment';
import { batchAPI } from '../../api/batch.api';
import { assignmentAPI } from '../../api/assignment.api';
import { userAPI } from '../../api/user.api';
import { format, isValid, parseISO } from 'date-fns';

const BatchDetails = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignmentType, setAssignmentType] = useState(null);
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [contents, setContents] = useState([]);
  const [creatorMap, setCreatorMap] = useState({});
  const [contentForm, setContentForm] = useState({ title: '', url: '', orderIndex: '' });
  const [editingContentId, setEditingContentId] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = typeof value === 'string' ? parseISO(value) : new Date(value);
    if (!isValid(date)) return 'N/A';
    try {
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await batchAPI.getBatchDetails(batchId);
        const data = res?.data?.data || res?.data || null;
        if (isMounted) setBatch(data);

        const assignmentsRes = await assignmentAPI.getMyAssignments({ page: 0, size: 1000 });
        const assignments = assignmentsRes?.data?.data?.content || [];
        const count = assignments.filter(
          (a) => String(a.batchId) === String(batchId)
        ).length;
        if (isMounted) setAssignmentCount(count);

        const contentRes = await batchAPI.getTeacherBatchContents(batchId);
        const loadedContents = contentRes?.data?.data || [];
        if (isMounted) setContents(loadedContents);

        const creatorIds = [...new Set(
          loadedContents
            .map((c) => Number(c.createdByTeacherId))
            .filter((id) => Number.isFinite(id) && id > 0)
        )];
        if (creatorIds.length > 0) {
          const profileResults = await Promise.allSettled(
            creatorIds.map((id) => userAPI.getUserById(id))
          );
          const nextMap = {};
          profileResults.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
              nextMap[creatorIds[idx]] = result.value?.data?.data || null;
            }
          });
          if (isMounted) setCreatorMap(nextMap);
        } else if (isMounted) {
          setCreatorMap({});
        }
      } catch (err) {
        if (isMounted) setBatch(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [batchId]);

  const assignmentTypes = [
    {
      type: 'TEXT',
      icon: FileText,
      title: 'Text Assignment',
      description: 'Students submit written responses',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'MCQ',
      icon: CheckCircle2,
      title: 'MCQ Quiz',
      description: 'Multiple choice questions with auto-grading',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      type: 'FILE',
      icon: Upload,
      title: 'File Upload',
      description: 'Students upload PDF, DOC, DOCX, ZIP files',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
    },
  ];

  const handleCreateAssignment = (type) => {
    setAssignmentType(type);
    setShowCreateModal(true);
  };

  const handleAssignmentCreated = () => {
    setShowCreateModal(false);
  };

  const resetContentForm = () => {
    setContentForm({ title: '', url: '', orderIndex: '' });
    setEditingContentId(null);
  };

  const handleSaveContent = async () => {
    if (!contentForm.title.trim() || !contentForm.url.trim()) return;
    try {
      const payload = {
        title: contentForm.title.trim(),
        url: contentForm.url.trim(),
        orderIndex: contentForm.orderIndex === '' ? 0 : Number(contentForm.orderIndex),
      };
      if (editingContentId) {
        await batchAPI.updateTeacherBatchContent(batchId, editingContentId, payload);
      } else {
        await batchAPI.addTeacherBatchContent(batchId, payload);
      }
      const contentRes = await batchAPI.getTeacherBatchContents(batchId);
      setContents(contentRes?.data?.data || []);
      resetContentForm();
    } catch (e) {
    }
  };

  const handleEditContent = (content) => {
    setEditingContentId(content.id);
    setContentForm({
      title: content.title || '',
      url: content.url || '',
      orderIndex: content.orderIndex ?? '',
    });
  };

  const handleDeleteContent = async (content) => {
    try {
      await batchAPI.removeTeacherBatchContent(batchId, content.id);
      setContents((prev) => prev.filter((c) => c.id !== content.id));
      if (editingContentId === content.id) resetContentForm();
    } catch (e) {
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {loading && (
          <Card className="p-6">
            <p className="text-gray-600">Loading batch details...</p>
          </Card>
        )}
        {!loading && !batch && (
          <Card className="p-6">
            <p className="text-gray-600">
              Batch not found or you do not have access to this batch.
            </p>
          </Card>
        )}
<div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/teacher/batches')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {batch?.name || 'Batch Details'}
                </h1>
                {batch?.status && <Badge variant="published">{batch.status}</Badge>}
              </div>
              <p className="text-gray-600 mt-1 font-mono">{batch?.batchCode}</p>
            </div>
          </div>
        </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
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
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-lg font-semibold text-gray-900">
                  {batch?.totalStudents || batch?.studentCount || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-lg font-semibold text-gray-900">
                  {assignmentCount}
                </p>
              </div>
            </div>
          </Card>
        </div>
<div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Assignment
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assignmentTypes.map((type) => (
              <Card
                key={type.type}
                hover={!type.disabled}
                className={`p-6 cursor-pointer transition-all ${
                  type.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !type.disabled && handleCreateAssignment(type.type)}
              >
                <div className={`p-3 ${type.bgColor} rounded-lg w-fit mb-4`}>
                  <type.icon className={`w-8 h-8 ${type.textColor}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                {type.disabled ? (
                  <Badge variant="default" size="sm">Coming Soon</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Links</h2>
          <Card className="p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={contentForm.title}
                onChange={(e) => setContentForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Content title"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="url"
                value={contentForm.url}
                onChange={(e) => setContentForm((p) => ({ ...p, url: e.target.value }))}
                placeholder="https://course-link"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="number"
                value={contentForm.orderIndex}
                onChange={(e) => setContentForm((p) => ({ ...p, orderIndex: e.target.value }))}
                placeholder="Order"
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveContent}>
                  {editingContentId ? 'Update' : 'Add'}
                </Button>
                {editingContentId && (
                  <Button variant="outline" onClick={resetContentForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {contents.length > 0 ? (
            <div className="space-y-2">
              {contents.map((content) => {
                const canModify = Number(content.createdByTeacherId) === Number(user?.id);
                const creator = creatorMap[content.createdByTeacherId];
                const creatorName = [
                  creator?.firstName,
                  creator?.lastName,
                ].filter(Boolean).join(' ').trim();
                return (
                  <Card key={content.id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{content.title}</p>
                        <a
                          href={content.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-700 hover:text-indigo-900 flex items-center gap-1 mt-1"
                        >
                          <LinkIcon className="w-4 h-4" />
                          {content.url}
                        </a>
                        <p className="text-xs text-gray-500 mt-1">
                          Added by {canModify
                            ? 'You'
                            : (creatorName || 'Instructor')}
                          {!canModify && creator?.email ? ` (${creator.email})` : ''}
                        </p>
                      </div>
                      {canModify ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditContent(content)}>
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteContent(content)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Read only</span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-4">
              <p className="text-sm text-gray-600">No course links added yet.</p>
            </Card>
          )}
        </div>

      </div>
<Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Create ${
          assignmentType === 'MCQ'
            ? 'MCQ'
            : assignmentType === 'FILE'
            ? 'File'
            : 'Text'
        } Assignment`}
        size={assignmentType === 'MCQ' ? 'xl' : 'lg'}
      >
        {assignmentType === 'TEXT' && (
          <CreateTextAssignment
            batchId={parseInt(batchId)}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleAssignmentCreated}
          />
        )}
        {assignmentType === 'MCQ' && (
          <CreateMcqAssignment
            batchId={parseInt(batchId)}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleAssignmentCreated}
          />
        )}
        {assignmentType === 'FILE' && (
          <CreateFileAssignment
            batchId={parseInt(batchId)}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleAssignmentCreated}
          />
        )}
      </Modal>
    </Layout>
  );
};

export default BatchDetails;

