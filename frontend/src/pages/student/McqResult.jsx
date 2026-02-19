import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Award, CheckCircle2, XCircle, Clock } from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentAPI } from '../../api/student.api';

const McqResult = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!result);

  useEffect(() => {
    if (!result) {
      loadResult();
    }
  }, [assignmentId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getMcqResult(assignmentId);
      setResult(response.data.data);
    } catch (error) {
      console.error('Failed to load result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-48 bg-slate-200 rounded-xl"></div>
        </div>
      </StudentLayout>
    );
  }

  const percentage = result?.percentage || 0;
  const passed = result?.passed;
  const correctCount =
    result?.correctCount ??
    result?.questionResults?.filter((q) => q.isCorrect).length ??
    0;
  const incorrectCount =
    result?.incorrectCount ??
    result?.questionResults?.filter((q) => !q.isCorrect).length ??
    (result?.totalQuestions != null ? result.totalQuestions - correctCount : 0);

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/student/assignments')}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Assignments</span>
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {result?.assignmentTitle || 'Quiz Result'}
              </h1>
              <p className="text-sm text-slate-600">
                {passed ? 'Passed' : 'Not Passed'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">
                {percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">
                {result?.obtainedMarks}/{result?.totalMarks} marks
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-slate-900 rounded-md">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                Correct
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {correctCount}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-slate-900 rounded-md">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                Incorrect
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {incorrectCount}
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-slate-900 rounded-md">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">
                Time
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {result?.timeTaken
                ? `${Math.floor(result.timeTaken / 60)}:${(result.timeTaken % 60)
                    .toString()
                    .padStart(2, '0')}`
                : 'N/A'}
            </p>
          </div>
        </div>

        {result?.questionResults && (
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Question Breakdown
            </h2>

            <div className="space-y-4">
              {result.questionResults.map((question, index) => (
                <div
                  key={question.questionId || index}
                  className={`p-4 rounded-lg border ${
                    question.isCorrect
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-rose-200 bg-rose-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 bg-slate-900 text-white">
                      {question.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">
                        Question {index + 1}: {question.questionText}
                      </h3>

                      <div className="space-y-2">
                        {question.options?.map((option) => {
                          const isCorrect = question.correctAnswers?.includes(
                            option.id
                          );
                          const isSelected = question.selectedOptions?.includes(
                            option.id
                          );

                          return (
                            <div
                              key={option.id}
                              className={`p-3 rounded-md flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-100 border border-emerald-300'
                                  : isSelected
                                  ? 'bg-rose-100 border border-rose-300'
                                  : 'bg-white border border-slate-200'
                              }`}
                            >
                              <span className="font-medium text-slate-900">
                                {option.text}
                              </span>
                              <div className="flex items-center space-x-2">
                                {isSelected && (
                                  <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-1 rounded">
                                    Your Answer
                                  </span>
                                )}
                                {isCorrect && (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 text-sm">
                        <span
                          className={`font-semibold ${
                            question.isCorrect
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {question.marksObtained}/{question.marks} marks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => navigate('/student/assignments')}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Back to Assignments
          </button>
          <button
            onClick={() => navigate('/student/batches')}
            className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-semibold hover:bg-slate-800 transition-all"
          >
            View My Batches
          </button>
        </div>
      </div>
    </StudentLayout>
  );
};

export default McqResult;
