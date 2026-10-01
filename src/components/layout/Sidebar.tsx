'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Ticket,
  BarChart2,
  Calendar,
  LogOut,
  X,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/' || pathname === '/dashboard',
    },
    {
      name: 'My Courses',
      href: '/courses',
      icon: BookOpen,
      active: pathname.startsWith('/courses'),
    },
    {
      name: 'Support',
      href: '/support',
      icon: Ticket,
      badge: 2,
      active: pathname.startsWith('/support'),
    },
    {
      name: 'Performance',
      href: '/performance',
      icon: BarChart2,
      active: pathname.startsWith('/performance'),
    },
    {
      name: 'Events',
      href: '/events',
      icon: Calendar,
      active: pathname.startsWith('/events'),
    },
  ];

  return (
    <aside className="w-64 bg-[#f8faf9] border-r border-[#eaedf0] min-h-screen flex flex-col justify-between py-6 px-4">
      {/* Top Header & Navigation */}
      <div>
        <div className="flex items-center justify-between px-3 mb-8">
          <Logo size="md" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-200"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#121614] text-white shadow-xs font-semibold'
                    : 'text-[#4b5563] hover:text-[#111827] hover:bg-[#eef2f0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-[#6b7280]'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && !isActive && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-[#e8f8f0] text-[#059669] rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="pt-6 border-t border-[#eaedf0] px-2">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-xs text-gray-500">
            Role: <span className="capitalize font-semibold text-gray-700">{user?.role || 'Learner'}</span>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#4b5563] hover:text-red-600 hover:bg-red-50/60 transition-colors"
        >
          <LogOut className="w-4 h-4 text-[#6b7280] group-hover:text-red-600" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
