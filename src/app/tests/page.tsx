'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useTests } from '@/context/TestContext';
import { Quiz, StudentQuizAttempt } from '@/types';
import { TestTakingModal } from '@/components/quiz/TestTakingModal';
import { CsvQuizUploadModal } from '@/components/admin/CsvQuizUploadModal';
import { AdminQuizStatsCard } from '@/components/admin/AdminQuizStatsCard';
import {
  FileCheck,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function TestsPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const { quizzes, attempts, stats } = useTests();

  useEffect(() => {
    router.replace('/assessments?tab=quizzes');
  }, [router]);

  const isAdmin = role === 'admin' || user?.role === 'admin';

  // State for Learner & Admin Interactions
  const [selectedQuizForTest, setSelectedQuizForTest] = useState<Quiz | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const studentEmail = user?.email || '';
  const myAttempts = studentEmail
    ? attempts.filter(
        (a) => a.studentEmail && a.studentEmail.toLowerCase() === studentEmail.toLowerCase()
      )
    : [];

  const isQuizCompletedByMe = (quizId: string) => {
    return myAttempts.some((a) => a.quizId === quizId);
  };

  const getMyLatestAttempt = (quizId: string) => {
    return myAttempts.find((a) => a.quizId === quizId);
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(search.toLowerCase()) ||
      quiz.courseCode.toLowerCase().includes(search.toLowerCase());

    const completed = isQuizCompletedByMe(quiz.id);
    if (filter === 'Pending') return matchesSearch && !completed;
    if (filter === 'Completed') return matchesSearch && completed;
    return matchesSearch;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#121614] text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
            <div className="w-6 h-6 rounded-full bg-[#3ECE92]/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]">
                <FileCheck className="w-3.5 h-3.5" />
                {isAdmin ? 'Institutional Assessment Center' : 'Learner Examinations'}
              </span>
              <span className="text-xs text-gray-400 font-mono">• Term: Fall 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
              {isAdmin ? 'Assessments & Examination Management' : 'Course Quizzes & Milestone Assessments'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isAdmin
                ? 'Create time-limited tests via CSV, monitor cohort scores, and analyze pass rates.'
                : 'Take timed course evaluations to validate your domain understanding and unlock milestone credits.'}
            </p>
          </div>

          {/* Admin Header Action */}
          {isAdmin && (
            <button
              onClick={() => setIsCsvModalOpen(true)}
              id="admin-upload-quiz-csv-btn"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-sm transition-all active:scale-95 self-start md:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Create Test via CSV</span>
            </button>
          )}
        </div>

        {/* ================= IF ADMIN: FULL STATS & MANAGEMENT VIEW ================= */}
        {isAdmin ? (
          <div className="space-y-6">
            <AdminQuizStatsCard onOpenCreateModal={() => setIsCsvModalOpen(true)} />
          </div>
        ) : (
          /* ================= IF LEARNER: TEST TAKING & GRADES HUB ================= */
          <div className="space-y-6">
            {/* Student Stats Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#eaedf0] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e8f8f0] flex items-center justify-center text-[#3ECE92]">
                  <Award className="w-6 h-6 text-[#3ECE92]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Completed Quizzes</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    {myAttempts.length} of {quizzes.length}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#eaedf0] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#e8f8f0] flex items-center justify-center text-[#3ECE92]">
                  <CheckCircle2 className="w-6 h-6 text-[#3ECE92]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Average Grade</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    {myAttempts.length > 0
                      ? `${Math.round(
                          myAttempts.reduce((sum, a) => sum + a.score, 0) / myAttempts.length
                        )}%`
                      : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#eaedf0] shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Pending Assessments</div>
                  <div className="text-xl font-bold font-mono text-gray-900 mt-0.5">
                    {Math.max(0, quizzes.length - myAttempts.length)}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-xl self-start">
                {(['All', 'Pending', 'Completed'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filter === tab
                        ? 'bg-[#121614] text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by title or course..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white border border-gray-200 focus:border-[#3ECE92] focus:ring-1 focus:ring-[#3ECE92] outline-none"
                />
              </div>
            </div>

            {/* Quizzes List Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredQuizzes.length === 0 ? (
                <div className="col-span-2 bg-white rounded-2xl p-12 border border-gray-200 text-center text-gray-400 text-xs">
                  No quizzes found matching this filter.
                </div>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const latestAttempt = getMyLatestAttempt(quiz.id);
                  const isCompleted = !!latestAttempt;

                  return (
                    <div
                      key={quiz.id}
                      className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-300 transition-all card-hover"
                    >
                      <div>
                        {/* Course & Status Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-[#e8f8f0] text-[#059669]">
                            {quiz.courseCode}
                          </span>

                          {isCompleted ? (
                            latestAttempt.passed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Passed ({latestAttempt.score}%)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-100 text-rose-800">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Retake ({latestAttempt.score}%)
                              </span>
                            )
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
                              Pending
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base font-bold text-gray-900 leading-snug">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>

                        {/* Assessment Meta Badges */}
                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-100 text-[11px] font-mono text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#3ECE92]" />
                            {quiz.timeLimitMinutes} mins limit
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                            {quiz.questions.length} questions
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-500" />
                            Pass: {quiz.passingPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* CTA Launcher */}
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400 font-mono">
                          {isCompleted
                            ? `Taken: ${latestAttempt.completedAt.split('•')[0]}`
                            : 'Untimed until started'}
                        </span>

                        <button
                          onClick={() => setSelectedQuizForTest(quiz)}
                          id={`start-quiz-${quiz.id}`}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            isCompleted
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-[#3ECE92] text-[#111614] hover:bg-[#34b780] shadow-sm'
                          }`}
                        >
                          <span>{isCompleted ? 'Retake Test' : 'Attend Test'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Student's Submissions Log Table */}
            {myAttempts.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-xs overflow-hidden mt-8">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">Your Assessment Records</h4>
                  <span className="text-xs font-mono text-gray-400">
                    {myAttempts.length} submissions logged
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 bg-[#fbfdfc] text-gray-400 font-mono text-[11px]">
                        <th className="py-3 px-6">ASSESSMENT</th>
                        <th className="py-3 px-6">COHORT</th>
                        <th className="py-3 px-6">SCORE</th>
                        <th className="py-3 px-6">RESULT</th>
                        <th className="py-3 px-6">COMPLETED AT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {myAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-gray-50/70">
                          <td className="py-3.5 px-6 font-semibold text-gray-900">
                            {att.quizTitle}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-gray-600">{att.courseCode}</td>
                          <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                            {att.score}% ({att.pointsScored}/{att.totalPoints} pts)
                          </td>
                          <td className="py-3.5 px-6">
                            {att.passed ? (
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                PASSED
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-rose-100 text-rose-800">
                                RETAKE
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-6 font-mono text-gray-400 text-[11px]">
                            {att.completedAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal: Interactive Test Taking Player */}
        <TestTakingModal
          quiz={selectedQuizForTest}
          isOpen={!!selectedQuizForTest}
          onClose={() => setSelectedQuizForTest(null)}
          onCompleted={(att) => {
            showToast(`Assessment submitted! Score: ${att.score}% (${att.passed ? 'Passed' : 'Retake'})`);
          }}
        />

        {/* Modal: CSV Quiz Creator for Admins */}
        <CsvQuizUploadModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
          onSuccess={() => showToast('New assessment created and published to students!')}
        />
      </div>
    </AppShell>
  );
}
