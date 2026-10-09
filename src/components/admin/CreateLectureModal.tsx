'use client';

import React, { useState } from 'react';
import {
  Video,
  Clock,
  Calendar,
  User,
  Sparkles,
  Link as LinkIcon,
  X,
  Radio,
  Send,
} from 'lucide-react';
import { useAttendance } from '@/context/AttendanceContext';
import { useAuth } from '@/context/AuthContext';

interface CreateLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (title: string, meetingUrl: string) => void;
}

const TEST_GMEET_URL = 'https://meet.google.com/jye-igap-skb';

export const CreateLectureModal: React.FC<CreateLectureModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { createLecture } = useAttendance();

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('AI-Native Project Management');
  const [instructor, setInstructor] = useState(user?.name || 'Admin Faculty');
  const [meetingUrl, setMeetingUrl] = useState(TEST_GMEET_URL);
  const [isLiveNow, setIsLiveNow] = useState(true);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [scheduledDate, setScheduledDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const created = await createLecture({
        title: title.trim(),
        course,
        instructor,
        meetingUrl: meetingUrl.trim() || TEST_GMEET_URL,
        durationMinutes,
        isLiveNow,
        scheduledDate: !isLiveNow && scheduledDate ? scheduledDate : undefined,
      });

      onClose();
      if (onSuccess) {
        onSuccess(created.title, created.meetingUrl || TEST_GMEET_URL);
      }

      // Reset form
      setTitle('');
    } catch (err) {
      console.error('Failed to create lecture:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]">
              <Video className="w-5 h-5 text-[#059669]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Launch Live Lecture</h3>
              <p className="text-xs text-gray-500">
                Pasting meet link broadcasts live stream & alerts all learners.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Lecture Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Lecture Title / Topic Name
            </label>
            <input
              type="text"
              required
              id="lecture-title-input"
              placeholder="e.g. Session 3: Neural Architectures & Transformer Scaling"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
            />
          </div>

          {/* Course & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Course</label>
              <select
                id="lecture-course-select"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] bg-white"
              >
                <option value="AI-Native Project Management">AI-Native Project Management (AINPM-101)</option>
                <option value="Module 1: AI Foundations">Module 1: AI Foundations</option>
                <option value="Module 2: AI Agents & Orchestration">Module 2: AI Agents & Orchestration</option>
                <option value="Module 3: AI-Native Project Management">Module 3: AI-Native Project Management</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Faculty / Instructor
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  id="lecture-instructor-input"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full text-xs p-2.5 pl-8 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                />
              </div>
            </div>
          </div>

          {/* Meeting Link (Google Meet) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700">
                Google Meet Link (or Conference URL)
              </label>
              <button
                type="button"
                onClick={() => setMeetingUrl(TEST_GMEET_URL)}
                className="text-[11px] font-semibold text-[#059669] hover:underline"
              >
                Insert Test GMeet
              </button>
            </div>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                id="lecture-meeting-url-input"
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 pl-9 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] font-mono text-gray-800"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              Active test link:{' '}
              <span className="font-mono text-gray-600 font-semibold">{TEST_GMEET_URL}</span>
            </p>
          </div>

          {/* Timing Mode: Live Now vs Scheduled */}
          <div className="bg-[#f8faf9] p-3.5 rounded-2xl border border-gray-200 space-y-3">
            <label className="block text-xs font-semibold text-gray-800">
              Classroom Timing Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-live-now-toggle"
                onClick={() => setIsLiveNow(true)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isLiveNow
                    ? 'bg-[#121614] text-white border-[#121614] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#3ECE92] animate-ping" />
                <span>Start Live Now</span>
              </button>

              <button
                type="button"
                id="btn-schedule-later-toggle"
                onClick={() => setIsLiveNow(false)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  !isLiveNow
                    ? 'bg-[#121614] text-white border-[#121614] shadow-xs'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>Schedule for Later</span>
              </button>
            </div>

            {!isLiveNow && (
              <div className="pt-2 animate-in fade-in duration-150">
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Scheduled Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  required={!isLiveNow}
                  id="lecture-scheduled-time-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#3ECE92]"
                />
              </div>
            )}
          </div>

          {/* Duration & Expiration Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Session Duration & Expiration Window
              </label>
              <span className="text-[11px] font-mono text-[#059669] font-bold">
                {durationMinutes} minutes
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[15, 30, 45, 60, 90, 120].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                    durationMinutes === mins
                      ? 'bg-[#3ECE92] text-[#111614] border-[#3ECE92] shadow-xs'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            <div className="mt-2 text-[11px] text-gray-500 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/70 flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Expiration lifecycle:</strong> Session will stay marked as{' '}
                <span className="text-[#059669] font-semibold">Live Now</span> for {durationMinutes}{' '}
                minutes. Once elapsed, its status automatically transitions to{' '}
                <span className="text-gray-700 font-semibold">Closed / Recording Available</span>.
              </span>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-create-lecture-btn"
              className="flex-1 bg-[#121614] hover:bg-black text-white font-semibold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-[#3ECE92]" />
              <span>
                {isLiveNow ? 'Broadcast & Launch Live Classroom' : 'Schedule & Broadcast Lecture'}
              </span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 border border-gray-200 text-gray-700 rounded-2xl text-xs hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
