'use client';

import React, { useState } from 'react';
import { SessionItem } from '@/types';
import { useAttendance } from '@/context/AttendanceContext';
import { AdminAttendanceModal } from '@/components/admin/AdminAttendanceModal';
import {
  Calendar,
  Video,
  Clock,
  Plus,
  ExternalLink,
  User,
  X,
  Play,
  Share2,
  UserCheck,
} from 'lucide-react';

interface AdminUpcomingEventsCardProps {
  events: SessionItem[];
  onAddEvent: (event: Omit<SessionItem, 'id'>) => void;
}

export const AdminUpcomingEventsCard: React.FC<AdminUpcomingEventsCardProps> = ({
  events,
  onAddEvent,
}) => {
  const { getSessionAttendance } = useAttendance();
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendanceSession, setSelectedAttendanceSession] = useState<SessionItem | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('Academic Information');
  const [newType, setNewType] = useState<'LIVE' | 'RECORDING'>('LIVE');
  const [newDate, setNewDate] = useState('Tomorrow');
  const [newTime, setNewTime] = useState('02:00 PM - 03:30 PM');
  const [newInstructor, setNewInstructor] = useState('Admin Faculty');
  const [newMeetingUrl, setNewMeetingUrl] = useState('https://meet.aivalytics.com/live-lecture');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddEvent({
      title: newTitle.trim(),
      course: newCourse,
      type: newType,
      status: 'Upcoming',
      date: newDate,
      time: newTime,
      instructor: newInstructor,
      meetingUrl: newMeetingUrl,
    });

    setNewTitle('');
    setShowModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] p-6 card-hover flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
              <Calendar className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Upcoming Events</h3>
              <p className="text-xs text-gray-400">Scheduled seminars, exams & reviews</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#3ECE92]" />
            <span>Schedule</span>
          </button>
        </div>

        {/* Events List */}
        <div className="divide-y divide-gray-100 max-h-[360px] overflow-y-auto">
          {events.map((event) => {
            const isLive = event.status === 'In Progress';
            const attendance = getSessionAttendance(event.id);
            const hasAttendance = attendance && attendance.totalEnrolled > 0;

            return (
              <div
                key={event.id}
                className="py-3.5 px-2 hover:bg-gray-50/70 rounded-xl transition-colors flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold text-[#059669] bg-[#e8f8f0] px-2 py-0.5 rounded-md">
                      {event.course}
                    </span>

                    {isLive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5ae4a8] text-[#111614]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#111614] animate-ping" />
                        <span>Live Now</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {event.type}
                      </span>
                    )}

                    {/* Attendance Badge Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedAttendanceSession(event)}
                      className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
                      title="Click to view and update student attendance"
                    >
                      <UserCheck className="w-3 h-3 text-[#059669]" />
                      <span>
                        {hasAttendance
                          ? `${attendance.presentCount + attendance.lateCount}/${attendance.totalEnrolled} Present (${attendance.attendanceRate}%)`
                          : 'Mark Attendance'}
                      </span>
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {event.title}
                  </h4>

                  <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {event.date} • {event.time}
                    </span>
                    {event.instructor && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {event.instructor}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-center flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedAttendanceSession(event)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 hover:text-emerald-800 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-2xs"
                    title="Mark / Update Student Attendance"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#3ECE92]" />
                    <span className="hidden sm:inline">Attendance</span>
                  </button>

                  {isLive ? (
                    <button
                      onClick={() => alert('Launching active live classroom for faculty!')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#3ECE92] text-[#111614] hover:bg-[#34be83] flex items-center gap-1 transition-transform hover:scale-105 shadow-sm"
                    >
                      <Video className="w-3 h-3 fill-current" />
                      <span>Join Room</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => alert('Opening event link: ' + (event.meetingUrl || event.recordingUrl))}
                      className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      title="Open meeting room"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Schedule Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Schedule Live Seminar</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Session Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Session 3: Model Evaluation & Loss Metrics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Course
                  </label>
                  <select
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  >
                    <option>Academic Information</option>
                    <option>Business Research Method</option>
                    <option>Applied AI Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Session Format
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'LIVE' | 'RECORDING')}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  >
                    <option value="LIVE">Live Interactive</option>
                    <option value="RECORDING">Prerecorded Video</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sep 15, 2026"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10:00 AM - 11:30 AM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Google Meet / Virtual Room URL
                </label>
                <input
                  type="url"
                  placeholder="https://meet.aivalytics.com/session-..."
                  value={newMeetingUrl}
                  onChange={(e) => setNewMeetingUrl(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Confirm Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Session Attendance Modal */}
      <AdminAttendanceModal
        isOpen={!!selectedAttendanceSession}
        onClose={() => setSelectedAttendanceSession(null)}
        session={selectedAttendanceSession}
        onSuccess={(msg) => {
          setFeedbackToast(msg);
          setTimeout(() => setFeedbackToast(null), 4000);
        }}
      />

      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121614] text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-6 h-6 rounded-full bg-[#3ECE92]/20 flex items-center justify-center">
            <UserCheck className="w-4 h-4 text-[#3ECE92]" />
          </div>
          <span className="text-xs font-medium">{feedbackToast}</span>
        </div>
      )}
    </div>
  );
};
