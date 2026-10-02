'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Quiz, StudentQuizAttempt } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useTests } from '@/context/TestContext';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Flag,
  Award,
  ChevronRight,
  RotateCcw,
  X,
} from 'lucide-react';

interface TestTakingModalProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (attempt: StudentQuizAttempt) => void;
}

export const TestTakingModal: React.FC<TestTakingModalProps> = ({
  quiz,
  isOpen,
  onClose,
  onCompleted,
}) => {
  const { user } = useAuth();
  const { submitQuizAttempt } = useTests();

  // Test Lifecycle States: 'briefing' | 'active' | 'submitting' | 'results'
  const [stage, setStage] = useState<'briefing' | 'active' | 'results'>('briefing');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);
  const [completedAttempt, setCompletedAttempt] = useState<StudentQuizAttempt | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or reset when quiz changes
  useEffect(() => {
    if (quiz && isOpen) {
      setStage('briefing');
      setCurrentQIndex(0);
      setAnswers({});
      setFlagged({});
      setCompletedAttempt(null);
      setShowConfirmSubmit(false);
      const totalSeconds = quiz.timeLimitMinutes * 60;
      setSecondsRemaining(totalSeconds);
      setTotalTimeSpent(0);
    }
  }, [quiz, isOpen]);

  // Countdown Timer Hook
  useEffect(() => {
    if (stage === 'active') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit(true); // Auto submit on timer expiry
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeSpent((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage]);

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQIndex];

  // Helper format seconds into MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleStartTest = () => {
    setStage('active');
  };

  const handleSelectOption = (optionKey: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionKey,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleFinalSubmit = (isTimeExpiry: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let pointsScored = 0;
    const totalPoints = quiz.totalPoints || questions.length * 5;

    questions.forEach((q) => {
      if (answers[q.id] === q.correctOption) {
        pointsScored += q.points;
      }
    });

    const scorePercentage = Math.round((pointsScored / totalPoints) * 100);
    const passed = scorePercentage >= quiz.passingPercentage;

    const attempt = submitQuizAttempt({
      quizId: quiz.id,
      quizTitle: quiz.title,
      courseCode: quiz.courseCode,
      studentId: user?.id || 'std_temp',
      studentName: user?.name || 'Alex Morgan',
      studentEmail: user?.email || 'alex.morgan@aivalytics.com',
      score: scorePercentage,
      pointsScored,
      totalPoints,
      passed,
      answers,
      timeSpentSeconds: totalTimeSpent,
    });

    setCompletedAttempt(attempt);
    setStage('results');
    setShowConfirmSubmit(false);
    if (onCompleted) onCompleted(attempt);
  };

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ================= STAGE 1: BRIEFING SCREEN ================= */}
        {stage === 'briefing' && (
          <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#e8f8f0] text-[#059669]">
                  {quiz.courseCode} Assessment
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {quiz.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {quiz.description}
                </p>
              </div>

              {/* Assessment Rules Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Clock className="w-4 h-4 text-[#3ECE92]" />
                    <span>Time Limit</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {quiz.timeLimitMinutes} Mins
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <HelpCircle className="w-4 h-4 text-[#3ECE92]" />
                    <span>Questions</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {questions.length} Items
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Award className="w-4 h-4 text-[#3ECE92]" />
                    <span>Pass Criterion</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {quiz.passingPercentage}% Required
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/70">
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
                    <span>Grading Mode</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mt-1">Instant Grading</p>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Examination Integrity Rules:
                </div>
                <ul className="list-disc list-inside space-y-1 text-amber-800 text-[11px] leading-relaxed">
                  <li>The countdown timer starts as soon as you click &ldquo;Begin Assessment&rdquo; and cannot be paused.</li>
                  <li>You can navigate back and forth between questions using the bottom buttons or question palette.</li>
                  <li>When the timer hits 00:00, your current answers will be automatically finalized and submitted.</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel & Exit
              </button>
              <button
                onClick={handleStartTest}
                id="start-assessment-btn"
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-md transition-all flex items-center gap-2"
              >
                <span>Begin Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STAGE 2: ACTIVE TEST TAKING ================= */}
        {stage === 'active' && currentQuestion && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Top Bar with Live Timer & Progress */}
            <div className="px-6 py-4 border-b border-gray-100 bg-[#f8faf9] flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-medium text-gray-500 uppercase tracking-wider">
                  {quiz.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-gray-900">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-gray-400">• {currentQuestion.points} points</span>
                </div>
              </div>

              {/* Countdown Timer Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold shadow-xs transition-colors ${
                  secondsRemaining < 120
                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}
              >
                <Clock
                  className={`w-4 h-4 ${
                    secondsRemaining < 120 ? 'text-red-500' : 'text-[#3ECE92]'
                  }`}
                />
                <span>{formatTime(secondsRemaining)}</span>
              </div>
            </div>

            {/* Main Interactive Question Body */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Question Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#059669] bg-[#e8f8f0] px-2.5 py-0.5 rounded-md">
                      Item {currentQuestion.questionNumber}
                    </span>
                    <button
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${
                        flagged[currentQuestion.id]
                          ? 'bg-amber-50 text-amber-700 border-amber-300 font-semibold'
                          : 'text-gray-500 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>{flagged[currentQuestion.id] ? 'Flagged' : 'Flag for review'}</span>
                    </button>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
                    {currentQuestion.questionText}
                  </h3>
                </div>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = currentQuestion.options[optKey];
                    if (!optText) return null;
                    const isSelected = answers[currentQuestion.id] === optKey;

                    return (
                      <button
                        key={optKey}
                        type="button"
                        onClick={() => handleSelectOption(optKey)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                          isSelected
                            ? 'bg-[#e8f8f0] border-[#3ECE92] shadow-sm text-gray-900'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-[#3ECE92] text-[#111614]'
                              : 'bg-gray-100 group-hover:bg-gray-200 text-gray-600'
                          }`}
                        >
                          {optKey}
                        </span>
                        <span className="text-xs sm:text-sm font-medium pt-0.5 leading-relaxed">
                          {optText}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Palette Matrix */}
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
                    Question Palette
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => {
                      const isAnswered = !!answers[q.id];
                      const isCurrent = currentQIndex === idx;
                      const isFlg = !!flagged[q.id];

                      let btnStyle = 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
                      if (isCurrent) {
                        btnStyle = 'ring-2 ring-[#121614] border-transparent font-bold';
                      } else if (isAnswered) {
                        btnStyle = 'bg-[#e8f8f0] text-[#059669] border-[#d1f4e2] font-semibold';
                      }

                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => setCurrentQIndex(idx)}
                          className={`relative w-8 h-8 rounded-lg text-xs font-mono border flex items-center justify-center transition-all ${btnStyle}`}
                        >
                          <span>{idx + 1}</span>
                          {isFlg && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Controls */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between">
              <button
                type="button"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-3">
                {currentQIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))
                    }
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    id="submit-quiz-btn"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#121614] hover:bg-black shadow-md transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>

            {/* Confirmation Dialog Overlay */}
            {showConfirmSubmit && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-40 animate-in fade-in duration-150">
                <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      Submit Assessment Now?
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      You have answered <span className="font-semibold text-gray-800">{answeredCount}</span> of{' '}
                      <span className="font-semibold text-gray-800">{questions.length}</span> questions.
                      {unansweredCount > 0 && (
                        <span className="text-amber-600 block mt-1 font-medium">
                          Warning: You have {unansweredCount} unanswered question(s).
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowConfirmSubmit(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Return to Quiz
                    </button>
                    <button
                      onClick={() => handleFinalSubmit(false)}
                      id="confirm-submit-quiz-btn"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780]"
                    >
                      Confirm Submission
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STAGE 3: RESULTS & EXPLANATIONS REVIEW ================= */}
        {stage === 'results' && completedAttempt && (
          <div className="p-6 sm:p-8 overflow-y-auto flex flex-col justify-between">
            <div className="space-y-6">
              {/* Score Header Card */}
              <div
                className={`p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  completedAttempt.passed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-xs shrink-0 ${
                      completedAttempt.passed
                        ? 'bg-[#3ECE92] text-[#111614]'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {completedAttempt.score}%
                  </div>
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-1 ${
                        completedAttempt.passed
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-rose-200 text-rose-900'
                      }`}
                    >
                      {completedAttempt.passed ? 'Assessment Passed' : 'Needs Retake'}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {completedAttempt.passed
                        ? 'Congratulations! You met the criteria.'
                        : 'Review the explanations below and try again.'}
                    </h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Scored {completedAttempt.pointsScored} out of {completedAttempt.totalPoints} points
                      • Required: {quiz.passingPercentage}%
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-mono text-xs text-gray-500 shrink-0">
                  <div>Time Spent: {formatTime(completedAttempt.timeSpentSeconds)}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {completedAttempt.completedAt}
                  </div>
                </div>
              </div>

              {/* Question By Question Feedback */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Detailed Answer Review & Explanations
                </h4>

                <div className="space-y-3">
                  {questions.map((q, idx) => {
                    const studentAns = completedAttempt.answers[q.id];
                    const isCorrect = studentAns === q.correctOption;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border text-xs space-y-2 transition-colors ${
                          isCorrect
                            ? 'bg-white border-gray-200'
                            : 'bg-rose-50/30 border-rose-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-semibold text-gray-900">
                            <span className="font-mono text-gray-400 mr-1.5">Q{idx + 1}.</span>
                            {q.questionText}
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Correct (+{q.points} pts)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Incorrect (0 pts)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Options Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                            const isSelected = studentAns === opt;
                            const isCorrectOpt = q.correctOption === opt;

                            let optStyle = 'border-gray-100 bg-gray-50/50 text-gray-600';
                            if (isCorrectOpt) {
                              optStyle =
                                'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optStyle =
                                'border-rose-300 bg-rose-50 text-rose-800 line-through';
                            }

                            return (
                              <div
                                key={opt}
                                className={`p-2 rounded-lg border flex items-center justify-between gap-2 ${optStyle}`}
                              >
                                <span>
                                  <strong>{opt}:</strong> {q.options[opt]}
                                </span>
                                {isCorrectOpt && (
                                  <span className="text-[10px] text-emerald-700 font-bold uppercase">
                                    Correct Answer
                                  </span>
                                )}
                                {isSelected && !isCorrectOpt && (
                                  <span className="text-[10px] text-rose-600 font-bold uppercase">
                                    Your Choice
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-700 flex items-start gap-2">
                            <HelpCircle className="w-3.5 h-3.5 text-[#3ECE92] shrink-0 mt-0.5" />
                            <span>
                              <strong>Explanation:</strong> {q.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Finish CTA */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#121614] hover:bg-black shadow-md transition-all"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
