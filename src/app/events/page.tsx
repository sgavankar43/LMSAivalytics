'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { mockRecentSessions } from '@/data/mockData';
import { SessionItem } from '@/types';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  Play,
  Share2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function EventsPage() {
  const [filter, setFilter] = useState<'All' | 'Live' | 'Upcoming' | 'Past'>('All');

  const upcomingSessions = [
    {
      id: 'live_active',
      title: 'Session 2: Grading & Evaluation',
      course: 'Academic Information',
      date: 'Today, Aug 18, 2026',
      time: '11:00 AM - 12:30 PM',
      duration: '1h 30m',
      instructor: 'Prof. Marcus Vance',
      status: 'In Progress' as const,
      isLiveNow: true,
      zoomLink: 'https://meet.aivalytics.com/grading-evaluation-live',
    },
    {
      id: 'up_1',
      title: 'Session 3: Quantitative Hypothesis Testing',
      course: 'Business Research Method',
      date: 'Sep 03, 2026',
      time: '03:00 PM - 04:30 PM',
      duration: '1h 30m',
      instructor: 'Dr. Sarah Jenkins',
      status: 'Upcoming' as const,
      isLiveNow: false,
    },
    {
      id: 'up_2',
      title: 'Session 4: Neural Embedding Paradigms',
      course: 'Applied AI Systems',
      date: 'Sep 10, 2026',
      time: '02:00 PM - 03:30 PM',
      duration: '1h 30m',
      instructor: 'Prof. Marcus Vance',
      status: 'Upcoming' as const,
      isLiveNow: false,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
              Live Sessions & Academic Events
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Join interactive real-time seminars, faculty office hours, and review archived video recordings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#e8f8f0] text-[#059669]">
              3 Live Sessions Scheduled
            </span>
          </div>
        </div>

        {/* Featured Banner: Live Session Active Now */}
        <div className="bg-gradient-to-r from-[#121614] to-[#1c2420] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-gray-800">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3ECE92] text-[#111614]">
                  <span className="w-2 h-2 rounded-full bg-[#111614] animate-ping" />
                  <span>Happening Now</span>
                </span>
                <span className="text-xs font-mono text-gray-400">Academic Information</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold">
                Session 2: Grading & Evaluation
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                Live interactive walkthrough of continuous evaluation criteria, academic rubric standards, and grading timelines with Dean Vance.
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#3ECE92]" />
                  11:00 AM - 12:30 PM (Ends in 25 mins)
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#3ECE92]" />
                  Prof. Marcus Vance
                </span>
              </div>
            </div>

            <button
              onClick={() => alert('Launching Live Classroom stream!')}
              className="bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[#3ECE92]/20 hover:scale-105 active:scale-95 shrink-0"
            >
              <Video className="w-4 h-4 fill-current" />
              <span>Join Live Classroom</span>
            </button>
          </div>
        </div>

        {/* Upcoming Scheduled Seminars */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-gray-900">
            Upcoming Live Schedule
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.slice(1).map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#059669] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full">
                      {session.course}
                    </span>
                    <span className="text-xs font-mono text-gray-400">{session.duration}</span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 mt-2">
                    {session.title}
                  </h4>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{session.date} at {session.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{session.instructor}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-400">Google Meet link opens 10m before</span>
                  <button
                    onClick={() => alert('Calendar reminder added for: ' + session.title)}
                    className="text-xs font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200/60 transition-colors"
                  >
                    + Add to Calendar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past Recorded Lectures Library */}
        <div className="bg-white rounded-2xl border border-[#eaedf0] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Recorded Live Archive
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Catch up on prior live seminar recordings with full timecoded transcripts.
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {mockRecentSessions
              .filter((s) => s.type === 'RECORDING')
              .map((session) => (
                <div
                  key={session.id}
                  className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-gray-50/60 p-2 rounded-xl transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{session.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {session.course} • Recorded on {session.date} • {session.duration}
                    </p>
                  </div>

                  <button
                    onClick={() => alert('Playing recording: ' + session.title)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#059669] bg-[#e8f8f0] hover:bg-[#d6f6e5] transition-colors self-end sm:self-center"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Watch Recording</span>
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
