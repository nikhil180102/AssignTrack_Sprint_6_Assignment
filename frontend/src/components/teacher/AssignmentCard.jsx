import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Users,
  MoreVertical,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { publishAssignment, closeAssignment, deleteAssignment } from '../../features/assignment/assignmentSlice';

const AssignmentCard = ({ assignment }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getTypeIcon = (type) => {
    const icons = {
      TEXT: FileText,
      MCQ: CheckCircle2,
      FILE: FileText,
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-5 h-5" />;
  };

  const getStatusVariant = (status) => {
    const variants = {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      CLOSED: 'closed',
    };
    return variants[status] || 'default';
  };

  const handlePublish = () => {
    dispatch(publishAssignment({
      id: assignment.assignmentId,
      type: assignment.type.toLowerCase()
    }));
  };

  const handleClose = () => {
    dispatch(closeAssignment({
      id: assignment.assignmentId,
      type: assignment.type.toLowerCase()
    }));
  };

  const handleDelete = () => {
    dispatch(deleteAssignment({
      id: assignment.assignmentId,
      type: assignment.type.toLowerCase()
    }));
    setShowDeleteConfirm(false);
  };

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-300">
            {getTypeIcon(assignment.type)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {assignment.description}
            </p>
          </div>
        </div>
<div className="relative">
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Open assignment actions"
            title="Open assignment actions"
            aria-expanded={showMenu}
            aria-controls={`assignment-menu-${assignment.assignmentId}`}
          >
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div
                id={`assignment-menu-${assignment.assignmentId}`}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
              >
                <button
                  onClick={() => {
                    navigate(`/teacher/assignments/${assignment.assignmentId}`);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    navigate(`/teacher/assignments/${assignment.assignmentId}/edit`);
                    setShowMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit
                </button>
                <button
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setShowMenu(false);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
<div className="flex flex-wrap gap-3 mb-4">
        <Badge variant={getStatusVariant(assignment.status)}>
          {assignment.status}
        </Badge>
        <Badge variant="primary">{assignment.type}</Badge>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4 mr-1" />
          {assignment.maxMarks} marks
        </div>
      </div>
<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Users className="w-4 h-4 mr-2" />
          {assignment.totalSubmissions || 0} submissions
        </div>
<div className="flex space-x-2">
          {assignment.status === 'DRAFT' && (
            <Button size="sm" variant="success" onClick={handlePublish}>
              Publish
            </Button>
          )}
          {assignment.status === 'PUBLISHED' && (
            <Button size="sm" variant="danger" onClick={handleClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Assignment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this assignment? Students won’t see it anymore.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default AssignmentCard;

