'use client';

import React, { useState } from 'react';
import { useTests } from '@/context/TestContext';
import { Quiz, StudentQuizAttempt } from '@/types';
import {
  FileCheck,
  Plus,
  Users,
  Award,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  Layers,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminQuizStatsCardProps {
  onOpenCreateModal: () => void;
}

export const AdminQuizStatsCard: React.FC<AdminQuizStatsCardProps> = ({
  onOpenCreateModal,
}) => {
  const { quizzes, attempts, stats, deleteQuiz } = useTests();
  const [activeTab, setActiveTab] = useState<'quizzes' | 'submissions'>('quizzes');
  const [search, setSearch] = useState('');
  const [inspectQuiz, setInspectQuiz] = useState<Quiz | null>(null);

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.courseCode.toLowerCase().includes(search.toLowerCase())
  );

  const filteredAttempts = attempts.filter(
    (a) =>
      a.studentName.toLowerCase().includes(search.toLowerCase()) ||
      a.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
      a.quizTitle.toLowerCase().includes(search.toLowerCase())
  );

  const inspectAttempts = inspectQuiz
    ? attempts.filter((a) => a.quizId === inspectQuiz.id)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#e8f8f0] text-[#3ECE92] flex items-center justify-center border border-[#d1f4e2]/70">
            <FileCheck className="w-5 h-5 text-[#3ECE92]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Assessment & Quiz Performance Stats
            </h3>
            <p className="text-xs text-gray-500">
              Institutional assessment results, passing ratios, and cohort submissions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenCreateModal}
            id="admin-create-test-csv-btn"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Test via CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Mini KPI Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-[#fbfdfc] border-b border-gray-100">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Published Quizzes</span>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900">
              {stats.totalQuizzes}
            </span>
            <span className="text-[11px] text-gray-400">assessments</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Student Attempts</span>
            <Users className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900">
              {stats.totalAttempts}
            </span>
            <span className="text-[11px] text-[#059669] font-medium">all cohorts</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Overall Pass Rate</span>
            <Award className="w-4 h-4 text-[#3ECE92]" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900">
              {stats.passRate}%
            </span>
            <span className="text-[11px] text-[#059669] font-medium">↑ 3% vs target</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-gray-900">
              {stats.avgScore}%
            </span>
            <span className="text-[11px] text-gray-400">across submissions</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search Controls */}
      <div className="p-4 sm:px-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/70 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quizzes'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Quizzes Overview ({quizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'submissions'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Recent Submissions ({attempts.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              activeTab === 'quizzes' ? 'Search by quiz or course...' : 'Search student or test...'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 focus:border-[#3ECE92] focus:ring-1 focus:ring-[#3ECE92] outline-none"
          />
        </div>
      </div>

      {/* Tab 1: Quizzes Table */}
      {activeTab === 'quizzes' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fbfdfc] text-gray-400 font-mono text-[11px]">
                <th className="py-3 px-6 font-medium">ASSESSMENT TITLE</th>
                <th className="py-3 px-6 font-medium">COHORT</th>
                <th className="py-3 px-6 font-medium">DURATION</th>
                <th className="py-3 px-6 font-medium">ATTEMPTS</th>
                <th className="py-3 px-6 font-medium">AVG SCORE</th>
                <th className="py-3 px-6 font-medium">PASS RATE</th>
                <th className="py-3 px-6 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No quizzes found matching your search.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-gray-900">{quiz.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {quiz.questions.length} Questions • {quiz.totalPoints} Total Points
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#e8f8f0] text-[#059669]">
                        {quiz.courseCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {quiz.timeLimitMinutes} mins
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-gray-800">
                      {quiz.totalAttempts}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{quiz.avgScore}%</span>
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3ECE92] rounded-full"
                            style={{ width: `${Math.min(100, quiz.avgScore)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-semibold text-[#059669]">
                      {quiz.passRate}%
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setInspectQuiz(quiz)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
                      >
                        <span>Submissions</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Recent Student Submissions Table */}
      {activeTab === 'submissions' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-[#fbfdfc] text-gray-400 font-mono text-[11px]">
                <th className="py-3 px-6 font-medium">STUDENT</th>
                <th className="py-3 px-6 font-medium">ASSESSMENT</th>
                <th className="py-3 px-6 font-medium">COHORT</th>
                <th className="py-3 px-6 font-medium">SCORE</th>
                <th className="py-3 px-6 font-medium">STATUS</th>
                <th className="py-3 px-6 font-medium">COMPLETED AT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-gray-900">{attempt.studentName}</div>
                      <div className="text-[11px] text-gray-400">{attempt.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-6 text-gray-800 font-medium max-w-xs truncate">
                      {attempt.quizTitle}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        {attempt.courseCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 font-mono font-bold text-gray-900">
                      {attempt.score}%{' '}
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({attempt.pointsScored}/{attempt.totalPoints} pts)
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      {attempt.passed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-[11px] text-gray-500">
                      {attempt.completedAt}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Drilldown Modal: Inspect Specific Quiz Submissions */}
      {inspectQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-gray-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#e8f8f0] text-[#059669]">
                  {inspectQuiz.courseCode}
                </span>
                <h3 className="text-base font-bold text-gray-900 mt-1">{inspectQuiz.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total Submissions: {inspectAttempts.length} • Pass Criterion:{' '}
                  {inspectQuiz.passingPercentage}%
                </p>
              </div>
              <button
                onClick={() => setInspectQuiz(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {inspectAttempts.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No learner submissions recorded for this test yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {inspectAttempts.map((att) => (
                    <div
                      key={att.id}
                      className="py-3 flex items-center justify-between text-xs gap-3"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{att.studentName}</div>
                        <div className="text-[11px] text-gray-400">{att.studentEmail}</div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="font-mono font-bold text-gray-900">{att.score}%</div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            {att.completedAt}
                          </div>
                        </div>
                        {att.passed ? (
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Passed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-rose-100 text-rose-800">
                            Retake Req.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setInspectQuiz(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
