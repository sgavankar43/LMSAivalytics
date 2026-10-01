'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, CheckCircle2, ChevronDown, ShieldCheck, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onOpenMobile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const { user, signOut, switchRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      title: 'Session Live Now',
      desc: 'Session 2: Grading & Evaluation is currently active in Academic Information.',
      time: 'Just now',
      unread: true,
    },
    {
      id: 2,
      title: 'Ticket Updated',
      desc: 'Faculty responded to ticket TKT-8492 on Research Design quiz access.',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Certificate Ready',
      desc: 'Foundations of Modern Data Literacy certificate is available to download.',
      time: '1 day ago',
      unread: false,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#f8faf9]/95 backdrop-blur-md border-b border-[#eaedf0] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile Hamburger & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

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
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3ECE92] rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-900">Notifications</span>
                <span className="text-xs text-[#059669] font-medium bg-[#e8f8f0] px-2 py-0.5 rounded-full">
                  2 unread
                </span>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-gray-50 transition-colors flex gap-3 text-left">
                    <div className="mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#3ECE92]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.desc}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
              {user?.initials || 'NS'}
            </div>
            <span className="text-sm font-semibold text-gray-800 hidden sm:inline-block">
              {user?.name || 'Nikunj Sonda'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:inline-block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <p className="text-xs font-semibold text-gray-900">{user?.name || 'Nikunj Sonda'}</p>
                <p className="text-[11px] text-gray-500 truncate">{user?.email || 'nikunj.sonda@aivalytics.com'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-medium bg-[#e8f8f0] text-[#059669] px-2 py-0.5 rounded-full capitalize">
                    {user?.role || 'Learner'} Account
                  </span>
                </div>
              </div>

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
                    <span>Learner (Nikunj)</span>
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
