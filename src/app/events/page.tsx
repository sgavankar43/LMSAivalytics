'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAttendance } from '@/context/AttendanceContext';
import { parseDbTimestamp } from '@/lib/dateUtils';
import { SessionItem } from '@/types';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  User,
  Play,
  ExternalLink,
  Radio,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export default function EventsPage() {
  const { sessions, activeLiveSession } = useAttendance();
  const [filter, setFilter] = useState<'All' | 'Live' | 'Upcoming' | 'Past'>('All');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const liveSessions = sessions.filter(s => s.status === 'In Progress');
  const upcomingSessions = sessions.filter(s => s.status === 'Upcoming');
  const pastSessions = sessions.filter(s => s.status === 'Closed');

  const filteredSessions = sessions.filter(session => {
    if (filter === 'Live') return session.status === 'In Progress';
    if (filter === 'Upcoming') return session.status === 'Upcoming';
    if (filter === 'Past') return session.status === 'Closed';
    return true;
  });

  const featured = activeLiveSession || liveSessions[0] || upcomingSessions[0];

  const getRemainingTimeText = (session: SessionItem) => {
    if (!session.expiresAt) return session.duration || '60m';
    const exp = parseDbTimestamp(session.expiresAt);
    const diff = exp - now;
    if (diff <= 0) return 'Expired / Closing';
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}m ${secs}s left`;
  };

  const handleJoin = (session: SessionItem) => {
    const url = session.meetingUrl || 'https://meet.google.com/jye-igap-skb';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

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
            {liveSessions.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                {liveSessions.length} Session{liveSessions.length > 1 ? 's' : ''} Live Now
              </span>
            )}
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#e8f8f0] text-[#059669]">
              {sessions.length} Total Sessions
            </span>
          </div>
        </div>

        {/* Featured Banner: Live Session Active Now or Next Upcoming */}
        {featured ? (
          <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border ${
            featured.status === 'In Progress'
              ? 'bg-gradient-to-r from-[#170a0a] via-[#1f1214] to-[#121614] border-red-500/40 ring-1 ring-red-500/30'
              : 'bg-gradient-to-r from-[#121614] to-[#1c2420] border-gray-800'
          }`}>
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {featured.status === 'In Progress' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>LIVE CLASSROOM IN SESSION</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3ECE92] text-[#111614]">
                      <span>Upcoming Academic Session</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-400">{featured.course}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold">
                  {featured.title}
                </h2>

                <p className="text-xs sm:text-sm text-gray-300 max-w-xl leading-relaxed">
                  Interactive real-time lecture session with live Q&amp;A and faculty discussion. All enrolled students are encouraged to attend.
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-2 font-mono">
                  {featured.status === 'In Progress' && (
                    <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800/50">
                      <Clock className="w-3.5 h-3.5 text-red-400" />
                      Expires in: {getRemainingTimeText(featured)}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#3ECE92]" />
                    {featured.date || 'Today'} • {featured.duration || '60m'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#3ECE92]" />
                    {featured.instructor || 'Faculty Member'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleJoin(featured)}
                  className={`font-bold px-6 py-3.5 rounded-2xl text-sm transition-all duration-200 flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 shrink-0 ${
                    featured.status === 'In Progress'
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30'
                      : 'bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] shadow-[#3ECE92]/20'
                  }`}
                >
                  <Video className="w-4 h-4 fill-current" />
                  <span>Join Live Google Meet</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filter Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          {(['All', 'Live', 'Upcoming', 'Past'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === tab
                  ? 'bg-[#111614] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab} {tab === 'Live' && liveSessions.length > 0 && `(${liveSessions.length})`}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session) => {
            const isLive = session.status === 'In Progress';
            const isClosed = session.status === 'Closed';

            return (
              <div
                key={session.id}
                className={`bg-white rounded-2xl p-5 border shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between ${
                  isLive
                    ? 'border-red-300 ring-2 ring-red-100'
                    : isClosed
                    ? 'border-gray-200 opacity-90'
                    : 'border-[#eaedf0] hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#059669] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full truncate max-w-[180px]">
                      {session.course}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLive
                          ? 'bg-red-500 text-white animate-pulse'
                          : isClosed
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {isLive ? '🔴 LIVE NOW' : session.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-gray-900 mt-2 line-clamp-2">
                    {session.title}
                  </h4>

                  <div className="mt-4 space-y-1.5 text-xs text-gray-500 font-mono">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{session.date || 'Today'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{isLive ? getRemainingTimeText(session) : session.duration || '60m'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{session.instructor || 'Faculty Member'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  {isLive ? (
                    <button
                      onClick={() => handleJoin(session)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Meet</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  ) : isClosed ? (
                    <button
                      onClick={() => alert(`Archived recording for: ${session.title}`)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Watch Archive</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleJoin(session)}
                      className="w-full bg-[#111614] hover:bg-black text-white font-semibold py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Open Meeting Room</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredSessions.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
            <Radio className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700">No sessions match this filter</h3>
            <p className="text-xs text-gray-400 mt-1">Check back later or switch filter to view all lectures.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
