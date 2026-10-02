'use client';

import React, { useState } from 'react';
import { BroadcastNotification } from '@/types';
import {
  BellRing,
  Send,
  Users,
  Filter,
  AlertTriangle,
  Info,
  AlertCircle,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface BroadcastCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  broadcasts: BroadcastNotification[];
  onSendBroadcast: (broadcast: Omit<BroadcastNotification, 'id' | 'sentAt' | 'readCount'>) => void;
}

export const BroadcastCenterModal: React.FC<BroadcastCenterModalProps> = ({
  isOpen,
  onClose,
  broadcasts,
  onSendBroadcast,
}) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<BroadcastNotification['priority']>('Important');
  const [targetType, setTargetType] = useState<BroadcastNotification['targetType']>('all');
  const [targetCourse, setTargetCourse] = useState('ACA-101');
  const [targetEmail, setTargetEmail] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    let targetValue: string | undefined = undefined;
    let recipientCount = 148;

    if (targetType === 'course') {
      targetValue = targetCourse;
      recipientCount = targetCourse === 'ACA-101' ? 42 : targetCourse === 'BRM-204' ? 64 : 42;
    } else if (targetType === 'individual') {
      targetValue = targetEmail;
      recipientCount = 1;
    }

    onSendBroadcast({
      title: title.trim(),
      message: message.trim(),
      priority,
      targetType,
      targetValue,
      totalTargetCount: recipientCount,
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setTitle('');
      setMessage('');
      setActiveTab('history');
    }, 1200);
  };

  const getPriorityStyle = (p: BroadcastNotification['priority']) => {
    switch (p) {
      case 'Urgent':
        return 'bg-red-50 text-red-600 border border-red-200';
      case 'Important':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Normal':
      default:
        return 'bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
              <BellRing className="w-5 h-5 text-[#3ECE92]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Broadcast Announcement Center</h2>
              <p className="text-xs text-gray-400">Push notifications to all students or target specific cohorts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-4 border-b border-gray-100 pb-2">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              activeTab === 'compose'
                ? 'bg-[#121614] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Compose & Push
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#121614] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Broadcast History</span>
            <span className="text-[10px] bg-gray-200 px-1.5 py-0.2 rounded-full font-mono">
              {broadcasts.length}
            </span>
          </button>
        </div>

        {/* COMPOSE TAB */}
        {activeTab === 'compose' && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {sentSuccess ? (
              <div className="p-8 text-center bg-[#e8f8f0] rounded-2xl border border-[#d1f4e2] animate-in zoom-in-95">
                <CheckCircle2 className="w-12 h-12 text-[#059669] mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-900">Notification Pushed Successfully!</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Dispatched to student portal and mobile notification queues.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Targeting & Audience Filter */}
                <div className="bg-[#f8faf9] p-4 rounded-2xl border border-gray-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-[#3ECE92]" />
                      <span>Audience Filtration & Targeting</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#059669] font-semibold bg-[#e8f8f0] px-2 py-0.5 rounded-md">
                      {targetType === 'all'
                        ? '148 Students (All)'
                        : targetType === 'course'
                        ? `Enrolled in ${targetCourse}`
                        : '1 Recipient'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('all')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                        targetType === 'all'
                          ? 'border-[#3ECE92] bg-white text-gray-900 shadow-xs ring-1 ring-[#3ECE92]'
                          : 'border-gray-200 bg-white/60 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className="block font-bold">All Students</span>
                      <span className="text-[10px] text-gray-400 font-normal">Institution-wide alert</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('course')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                        targetType === 'course'
                          ? 'border-[#3ECE92] bg-white text-gray-900 shadow-xs ring-1 ring-[#3ECE92]'
                          : 'border-gray-200 bg-white/60 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className="block font-bold">By Course Cohort</span>
                      <span className="text-[10px] text-gray-400 font-normal">Filter by enrolled class</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('individual')}
                      className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all ${
                        targetType === 'individual'
                          ? 'border-[#3ECE92] bg-white text-gray-900 shadow-xs ring-1 ring-[#3ECE92]'
                          : 'border-gray-200 bg-white/60 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className="block font-bold">Individual Student</span>
                      <span className="text-[10px] text-gray-400 font-normal">Specific email address</span>
                    </button>
                  </div>

                  {/* Sub-selectors */}
                  {targetType === 'course' && (
                    <div className="pt-2 animate-in fade-in duration-100">
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Select Target Course
                      </label>
                      <select
                        value={targetCourse}
                        onChange={(e) => setTargetCourse(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                      >
                        <option value="ACA-101">Academic Information & Governance (ACA-101) • 42 students</option>
                        <option value="BRM-204">Business Research Methodologies (BRM-204) • 64 students</option>
                        <option value="AML-305">Applied AI & Neural Predictive Analytics (AML-305) • 42 students</option>
                      </select>
                    </div>
                  )}

                  {targetType === 'individual' && (
                    <div className="pt-2 animate-in fade-in duration-100">
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Student Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="alex.morgan@aivalytics.com"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Priority Selection */}
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal', 'Important', 'Urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        priority === p
                          ? p === 'Urgent'
                            ? 'bg-red-50 text-red-700 border-red-300 font-bold'
                            : p === 'Important'
                            ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold'
                            : 'bg-[#e8f8f0] text-[#059669] border-[#3ECE92] font-bold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p === 'Urgent' ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : p === 'Important' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                      <span>{p} Priority</span>
                    </button>
                  ))}
                </div>

                {/* 3. Title & Body */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Announcement Headline
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule Update: Live Seminar link updated..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message Body & Instructions
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write detailed broadcast instructions for students..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                  />
                </div>

                {/* 4. Live Student View Preview */}
                <div className="p-3 bg-[#fafbfb] rounded-xl border border-dashed border-gray-300">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                    Live Student In-App Bell Preview:
                  </span>
                  <div className="flex gap-2.5 items-start">
                    <span className="w-2 h-2 rounded-full bg-[#3ECE92] shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-gray-900">{title || 'Announcement Title Preview'}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                        {message || 'Announcement message text will appear here for recipients.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#3ECE92] text-[#111614] hover:bg-[#34be83] flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Push Broadcast</span>
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="mt-5 space-y-3">
            {broadcasts.map((bc) => (
              <div
                key={bc.id}
                className="p-4 rounded-2xl border border-gray-200/80 bg-white hover:bg-gray-50/50 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getPriorityStyle(bc.priority)}`}>
                      {bc.priority}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{bc.title}</span>
                  </div>

                  <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {bc.sentAt}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">{bc.message}</p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100 font-mono">
                  <span>
                    Audience:{' '}
                    <strong className="text-gray-700 font-semibold">
                      {bc.targetType === 'all'
                        ? 'All Students'
                        : bc.targetType === 'course'
                        ? `Course: ${bc.targetValue}`
                        : `User: ${bc.targetValue}`}
                    </strong>
                  </span>
                  <span className="text-[#059669] font-medium">
                    ✓ Delivered to {bc.totalTargetCount} recipients ({bc.readCount} read)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
