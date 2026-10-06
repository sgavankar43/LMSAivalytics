'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SessionItem, AttendanceStatus } from '@/types';
import { useAttendance } from '@/context/AttendanceContext';
import {
  Calendar,
  Video,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  MessageSquare,
  Award,
  X,
} from 'lucide-react';

interface StudentAttendanceStackCardProps {
  sessions: SessionItem[];
  studentEmail: string;
}

interface StudentReflection {
  sessionId: string;
  takeaway: string;
  comprehension: 'Mastered' | 'Understood' | 'Needs Review';
  keyQuestion?: string;
  savedAt: string;
}

const STORAGE_KEY = 'aivalytics_student_reflections_v1';

export const StudentAttendanceStackCard: React.FC<StudentAttendanceStackCardProps> = ({
  sessions,
  studentEmail,
}) => {
  const { getSessionAttendance, getStudentAttendance } = useAttendance();
  const studentStats = getStudentAttendance(studentEmail);

  // Filter state: 'All' | 'Present' | 'Absent' | 'Live'
  const [filter, setFilter] = useState<'All' | 'Present' | 'Absent' | 'Live'>('All');

  // Reflection modal state
  const [selectedSessionForReflection, setSelectedSessionForReflection] = useState<SessionItem | null>(null);
  const [reflections, setReflections] = useState<Record<string, StudentReflection>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to load reflections', err);
      }
    }
    // Initial default reflection for demo
    return {
      sess_1: {
        sessionId: 'sess_1',
        takeaway: 'Key takeaway: Understanding program curriculum milestones and grading rubrics.',
        comprehension: 'Mastered',
        savedAt: 'Aug 04, 2026',
      },
    };
  });

  const [reflectionInput, setReflectionInput] = useState('');
  const [comprehensionInput, setComprehensionInput] = useState<'Mastered' | 'Understood' | 'Needs Review'>('Understood');
  const [questionInput, setQuestionInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save reflections to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reflections));
      } catch (err) {
        console.error('Failed to save reflections', err);
      }
    }
  }, [reflections]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to determine attendance status for this specific student
  const getAttendanceInfo = (session: SessionItem) => {
    const isLive = session.status === 'In Progress';
    const isUpcoming = session.status === 'Upcoming';

    if (isLive) {
      return {
        status: 'LIVE',
        label: '🔴 Live Now',
        sublabel: 'In Session',
        badgeBg: 'bg-[#5ae4a8] text-[#111614]',
        isLive: true,
      };
    }

    if (isUpcoming) {
      return {
        status: 'UPCOMING',
        label: 'Upcoming',
        sublabel: 'Scheduled',
        badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
        isUpcoming: true,
      };
    }

    // Check attendance record from session attendance map
    const sessionAtt = getSessionAttendance(session.id);
    const emailNorm = studentEmail.toLowerCase();
    const record = sessionAtt?.records?.[emailNorm];

    if (record) {
      if (record.status === 'PRESENT') {
        return {
          status: 'PRESENT',
          label: '✓ Present',
          sublabel: 'Attended (100%)',
          badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90',
        };
      }
      if (record.status === 'LATE') {
        return {
          status: 'LATE',
          label: '⏱ Late',
          sublabel: 'Partial Attendance',
          badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200/90',
        };
      }
      return {
        status: 'ABSENT',
        label: '✕ Absent',
        sublabel: 'Missed Lecture',
        badgeBg: 'bg-red-50 text-red-700 border border-red-200/90',
      };
    }

    // Fallback: check sessionDetails in studentStats
    const detail = studentStats.sessionDetails.find((d) => d.sessionId === session.id);
    if (detail) {
      if (detail.status === 'PRESENT') {
        return {
          status: 'PRESENT',
          label: '✓ Present',
          sublabel: 'Attended (100%)',
          badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90',
        };
      }
      if (detail.status === 'LATE') {
        return {
          status: 'LATE',
          label: '⏱ Late',
          sublabel: 'Partial Attendance',
          badgeBg: 'bg-amber-50 text-amber-800 border border-amber-200/90',
        };
      }
      return {
        status: 'ABSENT',
        label: '✕ Absent',
        sublabel: 'Missed Lecture',
        badgeBg: 'bg-red-50 text-red-700 border border-red-200/90',
      };
    }

    // Default for closed historical lectures: marked Present
    return {
      status: 'PRESENT',
      label: '✓ Present',
      sublabel: 'Attended (100%)',
      badgeBg: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90',
    };
  };

  // Open reflection modal
  const handleOpenReflection = (session: SessionItem) => {
    setSelectedSessionForReflection(session);
    const existing = reflections[session.id];
    if (existing) {
      setReflectionInput(existing.takeaway);
      setComprehensionInput(existing.comprehension);
      setQuestionInput(existing.keyQuestion || '');
    } else {
      setReflectionInput('');
      setComprehensionInput('Understood');
      setQuestionInput('');
    }
  };

  // Save reflection
  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForReflection) return;

    const newReflection: StudentReflection = {
      sessionId: selectedSessionForReflection.id,
      takeaway: reflectionInput.trim() || 'Attended lecture and reviewed lecture materials.',
      comprehension: comprehensionInput,
      keyQuestion: questionInput.trim() || undefined,
      savedAt: 'Just now',
    };

    setReflections((prev) => ({
      ...prev,
      [selectedSessionForReflection.id]: newReflection,
    }));

    showToast(`Reflection for "${selectedSessionForReflection.title.slice(0, 24)}..." saved!`);
    setSelectedSessionForReflection(null);
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const info = getAttendanceInfo(session);
    if (filter === 'Present') return info.status === 'PRESENT' || info.status === 'LATE';
    if (filter === 'Absent') return info.status === 'ABSENT';
    if (filter === 'Live') return info.status === 'LIVE' || info.status === 'UPCOMING';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 card-hover flex flex-col justify-between relative h-full">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="absolute top-4 right-4 z-30 bg-[#121614] text-white px-3.5 py-2 rounded-xl text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
              <Calendar className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Upcoming Events & Attendance</h3>
                <span className="text-[10px] font-mono font-bold bg-[#e8f8f0] text-[#059669] px-2 py-0.5 rounded-full border border-[#d1f4e2]">
                  {studentStats.percentage}% Attended
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Scheduled seminars, live classes & personal attendance reflection
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 self-start sm:self-center bg-[#fafbfb] p-1 rounded-xl border border-gray-200/70 text-xs font-semibold">
            {(['All', 'Present', 'Absent', 'Live'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                  filter === tab
                    ? 'bg-[#121614] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab}
                {tab === 'Present' && ` (${studentStats.attendedSessions})`}
                {tab === 'Absent' && ` (${studentStats.missedSessions})`}
              </button>
            ))}
          </div>
        </div>

        {/* Stack of Lecture Cards (divide-y stack matching admin dashboard) */}
        <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto pr-1">
          {filteredSessions.map((session) => {
            const attInfo = getAttendanceInfo(session);
            const isLive = session.status === 'In Progress';
            const hasReflection = Boolean(reflections[session.id]);
            const meetUrl = session.meetingUrl || 'https://meet.google.com/jye-igap-skb';

            return (
              <div
                key={session.id}
                className="py-3.5 px-2 hover:bg-gray-50/70 rounded-xl transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Top Badges Row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Course Badge */}
                    <span className="text-[10px] font-semibold text-[#059669] bg-[#e8f8f0] px-2 py-0.5 rounded-md truncate max-w-[170px]">
                      {session.course}
                    </span>

                    {/* Type Badge */}
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5ae4a8] text-[#111614]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111614] animate-ping" />
                        <span>Live Now</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {session.type}
                      </span>
                    )}

                    {/* ATTENDANCE STATUS BADGE FOR THIS STUDENT */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md transition-all shadow-2xs ${attInfo.badgeBg}`}
                      title={`Your attendance record for this session: ${attInfo.label}`}
                    >
                      {attInfo.status === 'PRESENT' && <CheckCircle2 className="w-3 h-3 text-[#059669]" />}
                      {attInfo.status === 'LATE' && <Clock className="w-3 h-3 text-amber-600" />}
                      {attInfo.status === 'ABSENT' && <XCircle className="w-3 h-3 text-red-600" />}
                      <span>{attInfo.label}</span>
                    </span>

                    {/* Reflection Tag Badge if student has already recorded notes */}
                    {hasReflection && (
                      <span
                        onClick={() => handleOpenReflection(session)}
                        className="inline-flex items-center gap-1 text-[9px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors"
                        title="Click to view your saved lecture reflection notes"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-purple-600" />
                        <span>Reflected</span>
                      </span>
                    )}
                  </div>

                  {/* Lecture Title */}
                  <h4
                    onClick={() => handleOpenReflection(session)}
                    className="text-xs font-bold text-gray-900 group-hover:text-emerald-900 transition-colors cursor-pointer line-clamp-1"
                  >
                    {session.title}
                  </h4>

                  {/* Date, Time & Instructor */}
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {session.date || 'Today'} • {session.time || '11:00 AM'}
                    </span>
                    {session.instructor && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {session.instructor}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Action Column */}
                <div className="shrink-0 self-center flex items-center gap-1.5">
                  {/* Reflection Action Button */}
                  <button
                    onClick={() => handleOpenReflection(session)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                      hasReflection
                        ? 'text-purple-800 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/80'
                        : 'text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300'
                    }`}
                    title="Add or review your personal lecture reflection"
                  >
                    <Sparkles className="w-3 h-3 text-[#3ECE92]" />
                    <span className="hidden sm:inline">
                      {hasReflection ? 'Reflection' : 'Reflect'}
                    </span>
                  </button>

                  {/* Join Room CTA for Live Sessions */}
                  {isLive ? (
                    <button
                      onClick={() => window.open(meetUrl, '_blank', 'noopener,noreferrer')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#3ECE92] text-[#111614] hover:bg-[#34be83] flex items-center gap-1 transition-transform hover:scale-105 shadow-sm cursor-pointer"
                      title="Join Live Google Meet Room"
                    >
                      <Video className="w-3 h-3 fill-current" />
                      <span>Join Room</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReflection(session)}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="View session record & reflections"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="py-8 text-center text-gray-400 space-y-1">
              <Calendar className="w-8 h-8 mx-auto text-gray-300 mb-1" />
              <p className="text-xs font-semibold text-gray-600">No sessions in this filter</p>
              <p className="text-[11px] text-gray-400">Switch filter to &quot;All&quot; to review complete history.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Reflection Tracker Bar */}
      <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="font-mono">
          Attendance: <strong className="text-gray-900">{studentStats.attendedSessions}</strong> attended,{' '}
          <strong className="text-gray-900">{studentStats.missedSessions}</strong> missed
        </span>
        <Link
          href="/events"
          className="text-xs font-semibold text-[#059669] hover:text-[#047857] flex items-center gap-1 hover:underline"
        >
          <span>View All Seminars</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Student Lecture Attendance & Reflection Modal */}
      {selectedSessionForReflection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]">
                  <Sparkles className="w-4 h-4 text-[#059669]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Lecture Reflection & Notes</h3>
                  <p className="text-xs text-gray-400">Reflect on key learning takeaways and attendance</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSessionForReflection(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Summary Box */}
            <div className="bg-[#f8faf9] p-4 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#059669] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full">
                  {selectedSessionForReflection.course}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${getAttendanceInfo(selectedSessionForReflection).badgeBg}`}>
                  {getAttendanceInfo(selectedSessionForReflection).label}
                </span>
              </div>
              <h4 className="text-sm font-bold text-gray-900">{selectedSessionForReflection.title}</h4>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono">
                <span>{selectedSessionForReflection.date} • {selectedSessionForReflection.time}</span>
                <span>• {selectedSessionForReflection.instructor || 'Faculty Member'}</span>
              </div>
            </div>

            {/* Reflection Form */}
            <form onSubmit={handleSaveReflection} className="space-y-4">
              {/* Comprehension Rating */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Comprehension & Understanding Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Mastered', 'Understood', 'Needs Review'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setComprehensionInput(level)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        comprehensionInput === level
                          ? level === 'Mastered'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : level === 'Understood'
                            ? 'bg-[#121614] text-white border-[#121614] shadow-xs'
                            : 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Takeaway */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Key Concept Takeaway & Summary
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What was the core principle covered in this lecture? e.g. Gradient accumulation enables training large batch sizes on memory-constrained GPUs..."
                  value={reflectionInput}
                  onChange={(e) => setReflectionInput(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] leading-relaxed resize-none"
                />
              </div>

              {/* Follow-up Questions / Office Hours */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Follow-up Question for Faculty Office Hours (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Can we review the attention masking formula in office hours?"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#121614] hover:bg-black text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5 text-[#3ECE92]" />
                  <span>Save Reflection</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSessionForReflection(null)}
                  className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
