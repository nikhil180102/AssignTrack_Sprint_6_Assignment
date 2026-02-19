import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { createTextAssignment } from '../../features/assignment/assignmentSlice';

const CreateTextAssignment = ({ batchId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    batchId: batchId,
    title: '',
    description: '',
    type: 'TEXT',
    maxMarks: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(createTextAssignment({
        ...formData,
        maxMarks: parseInt(formData.maxMarks),
      })).unwrap();

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assignment Title *
        </label>
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., ReactJS Routing Assignment"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Describe the assignment requirements..."
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Marks *
          </label>
          <Input
            type="number"
            name="maxMarks"
            value={formData.maxMarks}
            onChange={handleChange}
            placeholder="100"
            min="1"
            required
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Assignment
        </Button>
      </div>
    </form>
  );
};

export default CreateTextAssignment;
