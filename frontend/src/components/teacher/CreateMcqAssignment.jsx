import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Plus, Trash2, Check } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { createMcqAssignment } from '../../features/assignment/assignmentSlice';
import toast from 'react-hot-toast';

const CreateMcqAssignment = ({ batchId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    batchId: batchId,
    title: '',
    description: '',
    maxMarks: '',
    passingPercentage: 40,
    showCorrectAnswers: true,
    timeLimit: '',
    questions: [],
  });

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionNumber: prev.questions.length + 1,
          questionText: '',
          marks: 1,
          options: [
            { id: 1, text: '' },
            { id: 2, text: '' },
            { id: 3, text: '' },
            { id: 4, text: '' },
          ],
          correctAnswerId: null,
        },
      ],
    }));
  };

  const removeQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const updateOption = (questionIndex, optionId, text) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt) =>
                opt.id === optionId ? { ...opt, text } : opt
              ),
            }
          : q
      ),
    }));
  };

  const toggleCorrectAnswer = (questionIndex, optionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              correctAnswerId: optionId,
            }
          : q
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.questions.length === 0) {
        toast.error('Please add at least one question');
        setLoading(false);
        return;
      }

      const invalidQuestionIndex = formData.questions.findIndex(
        (q) => !q.correctAnswerId
      );
      if (invalidQuestionIndex !== -1) {
        toast.error(
          `Question ${invalidQuestionIndex + 1} must have exactly one correct option`
        );
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        maxMarks: parseInt(formData.maxMarks),
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit) : null,
        questions: formData.questions.map((q) => ({
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          marks: parseInt(q.marks),
          options: q.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.id === q.correctAnswerId,
          })),
        })),
      };

      await dispatch(createMcqAssignment(payload)).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create MCQ assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
<div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Title *
          </label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Java Fundamentals MCQ"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Describe the quiz..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Marks *
            </label>
            <Input
              type="number"
              value={formData.maxMarks}
              onChange={(e) =>
                setFormData({ ...formData, maxMarks: e.target.value })
              }
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes)
            </label>
            <Input
              type="number"
              value={formData.timeLimit}
              onChange={(e) =>
                setFormData({ ...formData, timeLimit: e.target.value })
              }
              placeholder="30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing Percentage *
            </label>
            <Input
              type="number"
              value={formData.passingPercentage}
              onChange={(e) =>
                setFormData({ ...formData, passingPercentage: parseInt(e.target.value) })
              }
              min="0"
              max="100"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="showAnswers"
            checked={formData.showCorrectAnswers}
            onChange={(e) =>
              setFormData({ ...formData, showCorrectAnswers: e.target.checked })
            }
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="showAnswers" className="ml-2 text-sm text-gray-700">
            Show correct answers after submission
          </label>
        </div>
      </div>
<div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
          <Button type="button" size="sm" icon={Plus} onClick={addQuestion}>
            Add Question
          </Button>
        </div>

        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="p-4 border border-gray-200 rounded-lg space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-700 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <Input
                value={question.questionText}
                onChange={(e) =>
                  updateQuestion(qIndex, 'questionText', e.target.value)
                }
                placeholder="Enter question text"
                required
              />
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks
              </label>
              <Input
                type="number"
                value={question.marks}
                onChange={(e) =>
                  updateQuestion(qIndex, 'marks', e.target.value)
                }
                min="1"
                required
              />
            </div>
<div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Options (click to mark as correct)
              </label>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrectAnswer(qIndex, option.id)}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      question.correctAnswerId === option.id
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      updateOption(qIndex, option.id, e.target.value)
                    }
                    placeholder={`Option ${option.id}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {formData.questions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No questions added yet. Click "Add Question" to get started.
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Create MCQ Assignment
        </Button>
      </div>
    </form>
  );
};

export default CreateMcqAssignment;

