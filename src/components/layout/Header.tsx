'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  BellRing,
  Menu,
  ChevronDown,
  ShieldCheck,
  UserCheck,
  User,
  ChevronRight,
  LogOut,
  X,
  Video,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';

interface HeaderProps {
  onOpenMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const { user, signOut, switchRole } = useAuth();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    cancelNotification,
    dismissNotification,
    activeAlert,
    dismissAlert,
  } = useNotifications();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-20 bg-[#f8faf9]/95 backdrop-blur-md border-b border-[#eaedf0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f1f3f2] hover:bg-[#ebedec] focus:bg-white text-sm text-gray-900 placeholder:text-gray-400 rounded-xl pl-10 pr-4 py-2 border border-transparent focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right Navigation & Profile */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-[#ebedec] transition-colors"
            aria-label="Notifications"
            title={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Notifications & Bulletins</span>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                      {unreadCount} unread
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      All caught up
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#059669] hover:text-[#047857] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-gray-300" />
                    <p className="text-xs font-medium">No announcements or alerts right now</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isUrgent = n.priority === 'Urgent';
                    const isImportant = n.priority === 'Important';

                    return (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3.5 hover:bg-gray-50/90 transition-colors flex items-start gap-3 text-left cursor-pointer group relative ${
                          n.unread ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        {/* Status Dot */}
                        <div className="mt-1 shrink-0">
                          {isUrgent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block ring-4 ring-red-100" />
                          ) : isImportant ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block ring-4 ring-amber-100" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#3ECE92] block ring-4 ring-emerald-100" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className={`text-xs font-bold ${n.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {n.title}
                              </p>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                  isUrgent
                                    ? 'bg-red-100 text-red-700'
                                    : isImportant
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {n.priority}
                              </span>
                              {n.type === 'broadcast' && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-200/60">
                                  Broadcast
                                </span>
                              )}
                            </div>

                            {/* Visible Cancel option on notification card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelNotification(n.id);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold text-gray-500 hover:text-red-700 bg-gray-100/80 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors shrink-0 cursor-pointer shadow-2xs"
                              title="Cancel this notification"
                            >
                              <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                              <span>Cancel</span>
                            </button>
                          </div>

                          <p className="text-xs text-gray-600 mt-1 leading-relaxed break-words">
                            {n.message}
                          </p>

                          {/* Join Live CTA if lecture/session meeting link */}
                          {(n.actionUrl || n.type === 'session') && (
                            <div className="mt-2.5">
                              <a
                                href={n.actionUrl || 'https://meet.google.com/jye-igap-skb'}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n.id);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#121614] text-white hover:bg-black transition-all shadow-xs"
                              >
                                <Video className="w-3.5 h-3.5 text-[#3ECE92]" />
                                <span>Join Live</span>
                              </a>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-1 border-t border-gray-100/70">
                            <span className="font-mono">{n.time}</span>
                            <div className="flex items-center gap-2">
                              {n.targetType === 'all' && (
                                <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                                  All Users
                                </span>
                              )}
                              {n.unread && (
                                <span className="text-[#059669] font-bold text-[9px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Floating Broadcast Alert Banner */}
        {activeAlert && (
          <div className="fixed top-18 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#121614] text-white p-4 rounded-2xl shadow-2xl border border-gray-700 animate-in slide-in-from-top-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#3ECE92]/20 flex items-center justify-center shrink-0 mt-0.5">
              <BellRing className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold text-[#3ECE92] uppercase tracking-wider">
                  {activeAlert.type === 'session' ? 'Live Classroom' : 'New Announcement'}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    activeAlert.priority === 'Urgent'
                      ? 'bg-red-500/20 text-red-300'
                      : activeAlert.priority === 'Important'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {activeAlert.priority}
                </span>
              </div>
              <p className="text-xs font-bold text-white mt-1 leading-snug">{activeAlert.title}</p>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed line-clamp-3">
                {activeAlert.message}
              </p>
              {(activeAlert.actionUrl || activeAlert.type === 'session') && (
                <div className="mt-2.5">
                  <a
                    href={activeAlert.actionUrl || 'https://meet.google.com/jye-igap-skb'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => dismissAlert()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#3ECE92] text-[#111614] hover:bg-[#34be83] transition-all shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5 fill-current" />
                    <span>Join Live</span>
                  </a>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={dismissAlert}
                className="px-2 py-1 text-[10px] font-semibold text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={dismissAlert}
                className="p-1 text-gray-400 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* User Pill Badge */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-gray-100/70 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#3ECE92] text-[#121614] flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.initials || 'AM'}
            </div>
            <span className="text-sm font-semibold text-gray-800 hidden sm:inline-block">
              {user?.name || 'Alex Morgan'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:inline-block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-900">{user?.name || 'Alex Morgan'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'alex.morgan@aivalytics.com'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-medium bg-[#e8f8f0] text-[#059669] px-2 py-0.5 rounded-full capitalize">
                    {user?.role || 'Learner'} Account
                  </span>
                </div>
              </div>

              {/* Direct Profile Link (Learners only) */}
              {user?.role !== 'admin' && (
                <div className="p-1 border-b border-gray-100 mb-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-gray-800 hover:bg-[#e8f8f0] hover:text-[#059669] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#3ECE92]" />
                      <span>My Profile & Certifications</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>
              )}

              {/* Role Switcher Demo Control */}
              <div className="px-2 py-1.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                  Preview Role
                </span>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      switchRole('learner');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      user?.role === 'learner'
                        ? 'bg-[#e8f8f0] text-[#059669]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Learner (Alex Morgan)</span>
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors ${
                      user?.role === 'admin'
                        ? 'bg-[#e8f8f0] text-[#059669]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Faculty / Admin</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
