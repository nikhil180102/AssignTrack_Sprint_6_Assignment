import React from 'react';
import { Calendar, Users, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { format, isValid, parseISO } from 'date-fns';

const BatchCard = ({ batch }) => {
  const navigate = useNavigate();

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

  const getStatusVariant = (status) => {
    const variants = {
      DRAFT: 'draft',
      PUBLISHED: 'published',
      CLOSED: 'closed',
    };
    return variants[status] || 'default';
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
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">{batch.batchCode}</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Calendar className="w-4 h-4 mr-2" />
          Started: {formatDate(batch.startDate)}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Users className="w-4 h-4 mr-2" />
          {batch.studentCount ?? batch.totalStudents ?? 0} Students
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <FileText className="w-4 h-4 mr-2" />
          {batch.assignmentCount ?? 0} Assignments
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        icon={ArrowRight}
        iconPosition="right"
        onClick={() => navigate(`/teacher/batches/${batch.id}`)}
      >
        View Details
      </Button>
    </Card>
  );
};

export default BatchCard;

