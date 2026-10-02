'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CircularProgressCard } from '@/components/dashboard/CircularProgressCard';
import { MonthlyBarChart } from '@/components/dashboard/MonthlyBarChart';
import { MiniStatCard } from '@/components/dashboard/MiniStatCard';
import { WeeklyActivityChart } from '@/components/dashboard/WeeklyActivityChart';
import { RecentSessionsTable } from '@/components/dashboard/RecentSessionsTable';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import {
  mockMetricCards,
  mockMonthlyAttendance,
  mockWeeklyActivity,
  mockRecentSessions,
} from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';
import { useAttendance } from '@/context/AttendanceContext';
import Link from 'next/link';
import { Calendar, ChevronDown, FileCheck, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, role, isLoading } = useAuth();
  const { getStudentAttendance } = useAttendance();
  const [selectedRange, setSelectedRange] = useState('Aug 1 - Aug 31, 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateRanges = [
    'Aug 1 - Aug 31, 2026',
    'Jul 1 - Jul 31, 2026',
    'Jun 1 - Jun 30, 2026',
    'Year-to-date (2026)',
  ];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';
  const isAdmin = role === 'admin' || user?.role === 'admin';

  // Dynamic live attendance calculation for the student
  const studentEmail = user?.email || 'alex.morgan@aivalytics.com';
  const studentAttendance = getStudentAttendance(studentEmail);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#3ECE92] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-gray-400">Loading AIvalytics workspace...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
          {/* Welcome Greeting & Date Range Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
                Good to see you, {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Here&apos;s how your learning is tracking this month.
              </p>
            </div>

            {/* Date Range Selector */}
            <div className="relative self-start sm:self-center">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium text-gray-600 bg-white border border-[#eaedf0] hover:bg-gray-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>{selectedRange}</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showDatePicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-1.5 z-30 animate-in fade-in duration-100">
                  {dateRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedRange(range);
                        setShowDatePicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg font-mono transition-colors ${
                        selectedRange === range
                          ? 'bg-[#e8f8f0] text-[#059669] font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Assessments & Project Submissions Callout Banner for Learners */}
          <div className="bg-linear-to-r from-[#121614] to-[#1c221f] text-white rounded-2xl p-5 border border-gray-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#3ECE92]/20 border border-[#3ECE92]/30 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 text-[#3ECE92]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#3ECE92] text-[#111614] px-2 py-0.5 rounded-full">
                    Assessments & Projects
                  </span>
                  <span className="text-xs text-gray-400 font-mono">• AI-Native Program</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  Guided Project Deliverables & Milestone Quizzes
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Submit module deliverables (PDF, PPT, DOC, images, demo links) for faculty review and complete timed quizzes.
                </p>
              </div>
            </div>

            <Link
              href="/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-sm transition-all active:scale-95 shrink-0 self-start sm:self-center"
            >
              <span>View Assessments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 1. Metric Cards Grid (4 in a row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {mockMetricCards.map((card) => (
              <MetricCard key={card.id} data={card} />
            ))}
          </div>

          {/* 2. Circular Progress Row (Course completion & Live attendance) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <CircularProgressCard
              title="Course completion"
              percentage={24}
              legend={[
                { label: 'Completed', value: '24%', color: '#3ECE92' },
                { label: 'Remaining', value: '76%', color: '#d1d5db' },
              ]}
              footerNote="Averaged across enrolled courses"
            />

            <CircularProgressCard
              title="Live attendance"
              percentage={studentAttendance.percentage}
              legend={[
                { label: 'Attended', value: `${studentAttendance.percentage}%`, color: '#3ECE92' },
                { label: 'Missed', value: `${100 - studentAttendance.percentage}%`, color: '#d1d5db' },
              ]}
              footerNote={`${studentAttendance.attendedSessions} of ${studentAttendance.totalSessions} live sessions attended`}
            />
          </div>

          {/* 3. Monthly Attendance Chart & Mini Stat Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 items-stretch">
            {/* Monthly Bar Chart (Span 2 cols on lg) */}
            <div className="lg:col-span-2">
              <MonthlyBarChart data={mockMonthlyAttendance} year="2026" />
            </div>

            {/* Mini Stat Cards Column (Span 1 col on lg) */}
            <div className="flex flex-col gap-4 sm:gap-5 justify-between">
              <MiniStatCard
                title="Certificates issued"
                subtitle="Programs completed"
                percentage={33}
                icon="award"
              />
              <MiniStatCard
                title="Tickets resolved"
                subtitle="0 of 2 closed"
                percentage={0}
                icon="ticket"
              />
            </div>
          </div>

          {/* 4. Weekly Learning Activity Chart */}
          <div>
            <WeeklyActivityChart data={mockWeeklyActivity} />
          </div>

          {/* 5. Recent Sessions Table */}
          <div>
            <RecentSessionsTable sessions={mockRecentSessions} />
          </div>
        </div>
      )}
    </AppShell>
  );
}
