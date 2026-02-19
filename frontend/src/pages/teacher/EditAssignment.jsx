import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { assignmentAPI } from '../../api/assignment.api';
import { updateAssignment } from '../../features/assignment/assignmentSlice';
import toast from 'react-hot-toast';

const EditAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { assignments } = useSelector((state) => state.assignment);

  const assignmentFromStore = useMemo(() => {
    const idNum = Number(assignmentId);
    return assignments.find((a) => a.assignmentId === idNum || a.id === idNum) || null;
  }, [assignments, assignmentId]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignment, setAssignment] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    maxMarks: '',
    passingPercentage: '',
    showCorrectAnswers: false,
    timeLimit: '',
  });

  const type = (assignment?.type || assignmentFromStore?.type || 'TEXT').toString().toLowerCase();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const details = await assignmentAPI.getAssignmentDetails(assignmentId, type);
        const data = details?.data?.data || details?.data;
        if (isMounted) {
          setAssignment(data || assignmentFromStore);
          setForm({
            title: data?.title || '',
            description: data?.description || '',
            maxMarks: data?.maxMarks ?? '',
            passingPercentage: data?.passingPercentage ?? '',
            showCorrectAnswers: Boolean(data?.showCorrectAnswers),
            timeLimit: data?.timeLimit ?? '',
          });
        }
      } catch (err) {
        if (isMounted) {
          setAssignment(assignmentFromStore);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [assignmentId, type, assignmentFromStore]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.maxMarks) {
      toast.error('Max marks is required');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      maxMarks: Number(form.maxMarks),
    };

    if (type === 'mcq') {
      payload.passingPercentage = form.passingPercentage ? Number(form.passingPercentage) : null;
      payload.showCorrectAnswers = Boolean(form.showCorrectAnswers);
      payload.timeLimit = form.timeLimit ? Number(form.timeLimit) : null;
    }

    try {
      setSaving(true);
      await dispatch(updateAssignment({ id: assignmentId, data: payload, type })).unwrap();
      navigate('/teacher/assignments');
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Assignment</h1>
            <p className="text-gray-600 mt-1">
              Update assignment details. Questions are not editable here.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher/assignments')}>
            Back
          </Button>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Assignment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Assignment description"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Marks
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={form.maxMarks}
                    onChange={(e) => handleChange('maxMarks', e.target.value)}
                  />
                </div>
              </div>

              {type === 'mcq' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing %
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={form.passingPercentage}
                      onChange={(e) => handleChange('passingPercentage', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Limit (min)
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={form.timeLimit}
                      onChange={(e) => handleChange('timeLimit', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      id="showCorrect"
                      type="checkbox"
                      checked={form.showCorrectAnswers}
                      onChange={(e) => handleChange('showCorrectAnswers', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="showCorrect" className="text-sm text-gray-700">
                      Show correct answers
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => navigate('/teacher/assignments')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default EditAssignment;

