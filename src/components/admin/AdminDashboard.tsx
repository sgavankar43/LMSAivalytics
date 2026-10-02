'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AdminTaskCard } from '@/components/admin/AdminTaskCard';
import { AdminUpcomingEventsCard } from '@/components/admin/AdminUpcomingEventsCard';
import { BroadcastCenterModal } from '@/components/admin/BroadcastCenterModal';
import { CsvUserImportModal } from '@/components/admin/CsvUserImportModal';
import { AdminStudentsTable } from '@/components/admin/AdminStudentsTable';
import { AdminEngagementChart } from '@/components/admin/AdminEngagementChart';
import { AdminQuizStatsCard } from '@/components/admin/AdminQuizStatsCard';
import { CsvQuizUploadModal } from '@/components/admin/CsvQuizUploadModal';
import {
  initialAdminMetrics,
  initialAdminTasks,
  initialBroadcasts,
  initialImportedStudents,
} from '@/data/adminMockData';
import { AdminTask, BroadcastNotification, ImportedStudent, SessionItem } from '@/types';
import { useAttendance } from '@/context/AttendanceContext';
import {
  BellRing,
  UserPlus,
  Calendar,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { sessions, addSession, overallInstitutionAttendance } = useAttendance();

  // State Management for Admin Operations
  const [tasks, setTasks] = useState<AdminTask[]>(initialAdminTasks);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotification[]>(initialBroadcasts);
  const [students, setStudents] = useState<ImportedStudent[]>(initialImportedStudents);

  // Modals state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Date range picker state
  const [selectedRange, setSelectedRange] = useState('Aug 1 - Aug 31, 2026');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const dateRanges = [
    'Aug 1 - Aug 31, 2026',
    'Jul 1 - Jul 31, 2026',
    'Current Semester (Fall 2026)',
    'Academic Year 2026',
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Task handlers
  const handleAddTask = (newTaskData: Omit<AdminTask, 'id' | 'createdAt'>) => {
    const newTask: AdminTask = {
      ...newTaskData,
      id: `task_${Date.now()}`,
      createdAt: 'Just now',
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title.slice(0, 30)}..." created successfully.`);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (taskToDelete) {
      showToast(`Task removed.`);
    }
  };

  // Event handlers
  const handleAddEvent = (newEventData: Omit<SessionItem, 'id'>) => {
    const newEvent = addSession(newEventData);
    showToast(`Session "${newEvent.title}" scheduled & attendance roster created.`);
  };

  // Broadcast handlers
  const handleSendBroadcast = (
    newBcData: Omit<BroadcastNotification, 'id' | 'sentAt' | 'readCount'>
  ) => {
    const newBroadcast: BroadcastNotification = {
      ...newBcData,
      id: `bc_${Date.now()}`,
      sentAt: 'Just now',
      readCount: 0,
    };
    setBroadcasts((prev) => [newBroadcast, ...prev]);
    showToast(
      `Broadcast "${newBroadcast.title.slice(0, 28)}..." dispatched to ${newBroadcast.totalTargetCount} learners!`
    );
  };

  // CSV Import handlers
  const handleImportStudents = (newStudents: ImportedStudent[]) => {
    setStudents((prev) => [...newStudents, ...prev]);
    showToast(`Successfully enrolled ${newStudents.length} students via CSV.`);
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast(`Student enrollment record deleted.`);
  };

  // Dynamic KPI Metrics computation
  const dynamicMetrics = initialAdminMetrics.map((metric) => {
    if (metric.id === 'total_students') {
      const totalEnrolled = 143 + students.length;
      return {
        ...metric,
        value: totalEnrolled,
        changeText: `+${students.length} from directory`,
      };
    }
    if (metric.id === 'avg_attendance') {
      return {
        ...metric,
        value: `${overallInstitutionAttendance}%`,
        changeText: `Across ${sessions.length} live sessions`,
      };
    }
    return metric;
  });

  const adminName = user?.name || 'Admin Faculty';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121614] text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-6 h-6 rounded-full bg-[#3ECE92]/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
          </div>
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Global Action Bar */}
      <div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Faculty & Admin Portal
            </span>
            <span className="text-xs text-gray-400 font-mono">• Term: Fall 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
            Institutional Control Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Welcome back, <span className="font-semibold text-gray-800">{adminName}</span>. Monitor cohorts, manage broadcast bulletins, and review learner activity.
          </p>
        </div>

        {/* Global Admin Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Push Broadcast Button */}
          <button
            onClick={() => setIsBroadcastModalOpen(true)}
            id="admin-push-broadcast-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#111614] bg-[#3ECE92] hover:bg-[#34b780] shadow-sm transition-all duration-150 active:scale-95"
          >
            <BellRing className="w-4 h-4" />
            <span>Broadcast Notice</span>
          </button>

          {/* Import CSV Button */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            id="admin-import-csv-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 shadow-xs transition-all duration-150 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-gray-500" />
            <span>Import CSV</span>
          </button>

          {/* Date Range Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-mono font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="hidden sm:inline">{selectedRange}</span>
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
      </div>

      {/* 1. Statistical Data KPI Overview (4 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {dynamicMetrics.map((card) => (
          <MetricCard key={card.id} data={card} />
        ))}
      </div>

      {/* 2. Side-by-Side: Upcoming Events Card & Task Management Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Upcoming Live Seminars & Events */}
        <AdminUpcomingEventsCard
          events={sessions}
          onAddEvent={handleAddEvent}
        />

        {/* Task Management Card with Manual Creation, Completion & Deletion */}
        <AdminTaskCard
          tasks={tasks}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      {/* 3. Examination & Quiz Performance Stats & Management */}
      <div id="quiz-management-section">
        <AdminQuizStatsCard
          onOpenCreateModal={() => setIsQuizModalOpen(true)}
        />
      </div>

      {/* 4. Institutional Engagement & Quiz Completion Trends */}
      <div>
        <AdminEngagementChart />
      </div>

      {/* 5. Enrolled Students Directory (CSV Import & Manual Management) */}
      <div id="students-section">
        <AdminStudentsTable
          students={students}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onDeleteStudent={handleDeleteStudent}
        />
      </div>

      {/* Broadcast Center Modal */}
      <BroadcastCenterModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        broadcasts={broadcasts}
        onSendBroadcast={handleSendBroadcast}
      />

      {/* CSV User Import Modal */}
      <CsvUserImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportStudents={handleImportStudents}
      />

      {/* CSV Quiz Upload Modal */}
      <CsvQuizUploadModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSuccess={() => showToast('New assessment created and published to students!')}
      />
    </div>
  );
};
