import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Send,
  Award,
  AlertCircle,
  FileText,
  Upload,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentAPI } from '../../api/student.api';
import {
  submitTextAssignment,
  submitFileAssignment,
} from '../../features/student/studentSlice';
import toast from 'react-hot-toast';

const TextAssignmentSubmit = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [assignment, setAssignment] = useState(null);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isFileAssignment = assignment?.type === 'FILE';

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAllAssignments();
      const all = response.data.data || [];
      const found = all.find(
        (a) => String(a.assignmentId || a.id) === String(assignmentId)
      );

      if (found?.submitted) {
        toast('Assignment already submitted', { icon: 'i' });
        navigate('/student/assignments');
        return;
      }
      setAssignment(found || null);
    } catch (error) {
      toast.error('Failed to load assignment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFileError('');
    setUploadProgress(0);

    if (isFileAssignment) {
      if (!selectedFile) {
        setFileError('Please select a file to upload.');
        return;
      }

      const ext = (selectedFile.name.split('.').pop() || '').toLowerCase();
      const allowed = ['pdf', 'doc', 'docx', 'zip'];
      if (!allowed.includes(ext)) {
        setFileError('Only PDF, DOC, DOCX, ZIP files are allowed.');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setFileError('Maximum file size is 10 MB.');
        return;
      }
    } else {
      if (content.trim().length < 50) {
        toast.error('Please write at least 50 characters');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isFileAssignment) {
        await dispatch(
          submitFileAssignment({
            assignmentId,
            file: selectedFile,
            onUploadProgress: (event) => {
              if (!event?.total) return;
              const percent = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percent);
            },
          })
        ).unwrap();
      } else {
        await dispatch(
          submitTextAssignment({
            assignmentId,
            data: { submissionContent: content },
          })
        ).unwrap();
      }
      navigate('/student/assignments');
    } catch (error) {
      if (isFileAssignment) {
        setFileError(mapUploadError(error));
      }
      console.error('Submission failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const mapUploadError = (raw) => {
    const message = String(raw || '').toLowerCase();
    if (message.includes('maximum allowed size') || message.includes('too large')) {
      return 'File is too large. Please upload up to 10 MB.';
    }
    if (message.includes('unsupported file type') || message.includes('extension')) {
      return 'Unsupported file type. Allowed: PDF, DOC, DOCX, ZIP.';
    }
    if (message.includes('file is required')) {
      return 'Please select a file to upload.';
    }
    return String(raw || 'Failed to upload file. Please try again.');
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-slate-900 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">{assignment?.title}</h1>
          </div>
          <p className="text-slate-200 text-sm mb-6">{assignment?.description}</p>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">{assignment?.maxMarks} Marks</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isFileAssignment ? (
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <label className="block mb-3">
                <span className="text-lg font-semibold text-gray-900">
                  Your Answer
                </span>
                <span className="text-sm text-gray-500 ml-2">(Minimum 50 characters)</span>
              </label>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                className="w-full px-4 py-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all text-slate-900 resize-none"
                placeholder="Write your detailed answer here..."
                required
              />

              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">{content.length} characters</span>
                {content.length > 0 && content.length < 50 && (
                  <span className="text-sm text-orange-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>At least {50 - content.length} more characters needed</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <label className="block mb-3">
                <span className="text-lg font-semibold text-gray-900">Upload Your File</span>
                <span className="text-sm text-gray-500 ml-2">
                  (PDF, DOC, DOCX, ZIP up to 10MB)
                </span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip"
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                  setFileError('');
                  setUploadProgress(0);
                }}
                className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200"
                required
              />
              {selectedFile && (
                <p className="mt-3 text-sm text-slate-700">
                  Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
              {submitting && (
                <div className="mt-3">
                  <div className="h-2 w-full rounded bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-slate-900 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
              {fileError && (
                <p className="mt-3 text-sm text-red-700">{fileError}</p>
              )}
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Submission Guidelines</span>
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>- Submit only your own work</li>
              <li>- Review before final submission</li>
              {isFileAssignment ? (
                <li>- Upload only allowed file format and size</li>
              ) : (
                <li>- Write clear and complete answer</li>
              )}
              <li>- You can only submit once</li>
            </ul>
          </div>

          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (!isFileAssignment && content.length < 50)}
              className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  {isFileAssignment ? (
                    <Upload className="w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{isFileAssignment ? 'Upload Assignment' : 'Submit Assignment'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </StudentLayout>
  );
};

export default TextAssignmentSubmit;

