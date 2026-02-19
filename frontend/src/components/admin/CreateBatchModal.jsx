import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../common/Button';
import Input from '../common/Input';
import { createBatch } from '../../features/admin/adminSlice';

const CreateBatchModal = ({ onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    batchCode: '',
    name: '',
    startDate: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(createBatch(formData)).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create batch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Batch Code *
        </label>
        <Input
          name="batchCode"
          value={formData.batchCode}
          onChange={handleChange}
          placeholder="e.g., BATCH-JAVA-2024"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the batch
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Batch Name *
        </label>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Java Full Stack Development"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date *
        </label>
        <Input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create Batch
        </Button>
      </div>
    </form>
  );
};

export default CreateBatchModal;