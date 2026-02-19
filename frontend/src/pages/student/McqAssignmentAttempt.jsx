import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Send,
  AlertTriangle,
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentAPI } from '../../api/student.api';
import { submitMcqAssignment } from '../../features/student/studentSlice';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const MAX_TAB_SWITCH_WARNINGS = 2; // On 3rd violation (warnings 0,1,2 then submit) we auto-submit

const McqAssignmentAttempt = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const submitRef = useRef(null);
  const hasAutoSubmitted = useRef(false);
const performSubmit = useCallback(
    async (isAutoSubmit = false) => {
      if (!assignment || hasAutoSubmitted.current) return;
      const isIncomplete = Object.keys(answers).length < (assignment?.questions?.length || 0);
      if (!isAutoSubmit && isIncomplete) {
        setShowSubmitConfirmModal(true);
        return;
      }

      hasAutoSubmitted.current = true;
      setSubmitting(true);
      if (isAutoSubmit && isIncomplete) {
        toast('Submitting with unanswered questions...', { icon: '⏱️', duration: 2000 });
      }
      try {
        const submissionData = {
          timeTaken: assignment.timeLimit
            ? assignment.timeLimit * 60 - (timeLeft ?? 0)
            : null,
          answers: Object.entries(answers).map(([questionNumber, selectedOptionIndex]) => ({
            questionNumber: parseInt(questionNumber),
            selectedOptionIndex,
          })),
        };

        const result = await dispatch(
          submitMcqAssignment({ assignmentId, data: submissionData })
        ).unwrap();

        navigate(`/student/assignments/mcq/${assignmentId}/result`, {
          state: { result },
        });
      } catch (error) {
        hasAutoSubmitted.current = false;
      } finally {
        setSubmitting(false);
      }
    },
    [assignment, answers, assignmentId, timeLeft, dispatch, navigate]
  );

  useEffect(() => {
    submitRef.current = performSubmit;
  }, [performSubmit]);

  const handleSubmitClick = () => performSubmit(false);
  const handleConfirmSubmitAnyway = () => {
    setShowSubmitConfirmModal(false);
    performSubmit(true);
  };

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          toast('Time\'s up! Submitting your answers...', { icon: '⏱️', duration: 2000 });
          submitRef.current?.(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  useEffect(() => {
    if (!assignment || submitting || loading) return;

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchWarnings((prev) => {
          const next = prev + 1;
          if (next > MAX_TAB_SWITCH_WARNINGS) {
            toast('Submitting automatically due to tab switch...', { duration: 2000 });
            submitRef.current?.(true);
            return MAX_TAB_SWITCH_WARNINGS;
          }
          setShowWarningModal(true);
          toast(`Warning ${next}/${MAX_TAB_SWITCH_WARNINGS}: Do not switch tabs.`, {
            duration: 4000,
          });
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [assignment, submitting, loading]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMcqAssignment(assignmentId);
      const data = response.data.data;
      setAssignment(data);
      if (data.timeLimit) {
        setTimeLeft(data.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      toast.error('Failed to load assignment');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionNumber, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: optionIndex,
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = assignment?.questions?.length || 0;

  if (loading) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
<button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
<div className="bg-slate-900 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{assignment?.title}</h1>
          <p className="text-purple-100 mb-6">{assignment?.description}</p>

          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="font-semibold">{assignment?.maxMarks} Marks</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>
            {timeLeft !== null && (
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md ${
                  timeLeft < 300 ? 'bg-rose-600' : 'bg-white/10'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
<div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {Math.round((answeredCount / totalQuestions) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
<div className="space-y-6">
          {assignment?.questions?.map((question, index) => (
            <div
              key={question.id || question.questionNumber || index}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-9 h-9 rounded-md bg-slate-900 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {question.questionText}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 ml-14">
                {question.options?.map((option, optionIndex) => (
                  <label
                    key={`${question.questionNumber}-${optionIndex}`}
                    className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all ${
                      answers[question.questionNumber] === optionIndex
                        ? 'border-slate-900 dark:border-slate-500 bg-slate-50 dark:bg-slate-700/50'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.questionNumber}`}
                      value={optionIndex}
                      checked={answers[question.questionNumber] === optionIndex}
                      onChange={() =>
                        handleAnswerChange(question.questionNumber, optionIndex)
                      }
                      className="w-4 h-4 text-slate-900"
                    />
                    <span className="text-gray-900 dark:text-gray-200 font-medium flex-1">
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
<Modal
          isOpen={showWarningModal}
          onClose={() => setShowWarningModal(false)}
          title="Do not switch tabs"
          size="sm"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              You left this tab. This is warning <strong>{tabSwitchWarnings}/{MAX_TAB_SWITCH_WARNINGS}</strong>.
              On the next violation your test will be <strong>submitted automatically</strong>.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stay on this tab until you submit your answers.
            </p>
            <button
              type="button"
              onClick={() => setShowWarningModal(false)}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              I understand
            </button>
          </div>
        </Modal>
<Modal
          isOpen={showSubmitConfirmModal}
          onClose={() => setShowSubmitConfirmModal(false)}
          title="Submit anyway?"
          size="sm"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              You have not answered all questions. Do you want to submit anyway?
            </p>
            <div className="flex gap-3 w-full sm:w-auto sm:flex-row flex-col">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitAnyway}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                Submit anyway
              </button>
            </div>
          </div>
        </Modal>
<div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-5 rounded-t-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Make sure you've answered all questions before submitting
              </p>
            </div>
            <button
              onClick={handleSubmitClick}
              disabled={submitting || answeredCount === 0}
              className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default McqAssignmentAttempt;
