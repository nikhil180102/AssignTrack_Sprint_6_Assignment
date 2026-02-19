import React from 'react';
import { Calendar, Users, ArrowRight, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { publishBatch } from '../../features/admin/adminSlice';

const BatchCard = ({ batch }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getStatusVariant = (status) => {
    const variants = {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      CLOSED: 'closed',
    };
    return variants[status] || 'default';
  };

  const handlePublish = (e) => {
    e.stopPropagation();
    dispatch(publishBatch(batch.id));
  };

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{batch.name}</h3>
            <Badge variant={getStatusVariant(batch.status)}>
              {batch.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded inline-block">
            {batch.batchCode}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-2" />
          Start: {formatDate(batch.startDate)}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Users className="w-4 h-4 mr-2" />
          {batch.teacherCount ?? 0} Instructors | {batch.studentCount ?? 0} Students
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          icon={Eye}
          onClick={() => navigate(`/admin/batches/${batch.id}`)}
        >
          Details
        </Button>
        {batch.status === 'DRAFT' && (
          <Button
            variant="success"
            size="sm"
            onClick={handlePublish}
          >
            Publish
          </Button>
        )}
      </div>
    </Card>
  );
};

export default BatchCard;

