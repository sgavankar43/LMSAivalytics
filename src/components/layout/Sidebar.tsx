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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  FileCheck,
  UserCheck,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarProps {
  onCloseMobile?: () => void;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  isMobileDrawer = false,
}) => {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // If in mobile drawer, never show retracted state
  const collapsed = isMobileDrawer ? false : isCollapsed;
  const isAdmin = user?.role === 'admin';

  const learnerNavItems = [
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
      name: 'Assessments',
      href: '/assessments',
      icon: FileCheck,
      badge: 'Projects',
      active: pathname.startsWith('/assessments') || pathname.startsWith('/tests'),
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

  const adminNavItems = [
    {
      name: 'Admin Dashboard',
      href: '/',
      icon: LayoutDashboard,
      active: pathname === '/' || pathname === '/dashboard',
    },
    {
      name: 'Attendance',
      href: '/attendance',
      icon: UserCheck,
      badge: 'Roster',
      active: pathname.startsWith('/attendance'),
    },
    {
      name: 'Assessments',
      href: '/assessments',
      icon: FileCheck,
      badge: 'Review',
      active: pathname.startsWith('/assessments') || pathname.startsWith('/tests'),
    },
    {
      name: 'Students & CSV',
      href: '/#students-section',
      icon: Users,
      badge: 'CSV',
      active: false,
    },
    {
      name: 'Courses & Cohorts',
      href: '/courses',
      icon: BookOpen,
      active: pathname.startsWith('/courses'),
    },
    {
      name: 'Support Tickets',
      href: '/support',
      icon: Ticket,
      badge: 2,
      active: pathname.startsWith('/support'),
    },
    {
      name: 'Events & Seminars',
      href: '/events',
      icon: Calendar,
      active: pathname.startsWith('/events'),
    },
  ];

  const navItems = isAdmin ? adminNavItems : learnerNavItems;

  return (
    <aside
      className={`bg-[#f8faf9] border-r border-[#eaedf0] h-screen sticky top-0 flex flex-col justify-between py-6 transition-all duration-300 ease-in-out z-30 select-none ${
        collapsed ? 'w-20 px-2' : 'w-64 px-4'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div
          className={`flex items-center mb-8 ${
            collapsed
              ? 'justify-center flex-col gap-3 px-1'
              : 'justify-between px-3'
          }`}
        >
          <Logo size="md" showText={!collapsed} />

          {/* Desktop Retract Toggle Button */}
          {!isMobileDrawer && (
            <button
              onClick={toggleSidebar}
              className={`p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-[#eef2f0] transition-colors hidden lg:flex items-center justify-center ${
                collapsed ? 'mt-1 w-8 h-8' : ''
              }`}
              title={collapsed ? 'Expand navbar' : 'Retract navbar'}
              aria-label={collapsed ? 'Expand navbar' : 'Retract navbar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-gray-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {/* Mobile Close Button */}
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

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            if (collapsed) {
              // RETRACTED STATE: Clean centered button with icon and hover tooltip
              return (
                <div key={item.name} className="relative group flex justify-center">
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    aria-label={item.name}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center relative transition-all duration-200 ${
                      isActive
                        ? 'bg-[#121614] text-white shadow-xs'
                        : 'text-[#4b5563] hover:text-[#111827] hover:bg-[#eef2f0]'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'text-white' : 'text-[#6b7280]'
                      }`}
                    />

                    {/* Retracted badge dot or count */}
                    {item.badge && !isActive && (
                      <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#3ECE92] text-[#111614] text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-[#f8faf9]">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Floating Tooltip */}
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121614] text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 flex items-center gap-1.5 top-1/2 -translate-y-1/2">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="text-[10px] bg-[#3ECE92] text-[#111614] px-1.5 py-0.2 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // EXPANDED STATE: Full width item with label and badge
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
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
      <div className={`pt-6 border-t border-[#eaedf0] ${collapsed ? 'px-1' : 'px-2'}`}>
        {!collapsed && (
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-xs text-gray-500">
              Role: <span className="capitalize font-semibold text-gray-700">{user?.role || 'Learner'}</span>
            </div>
          </div>
        )}

        {collapsed ? (
          // Retracted logout button with tooltip
          <div className="relative group flex justify-center">
            <button
              onClick={() => signOut()}
              aria-label="Log out"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-[#4b5563] hover:text-red-600 hover:bg-red-50/70 transition-colors"
            >
              <LogOut className="w-5 h-5 text-[#6b7280] group-hover:text-red-600" />
            </button>
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#121614] text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 top-1/2 -translate-y-1/2">
              Log out
            </div>
          </div>
        ) : (
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-[#4b5563] hover:text-red-600 hover:bg-red-50/60 transition-colors"
          >
            <LogOut className="w-4 h-4 text-[#6b7280] group-hover:text-red-600" />
            <span>Log out</span>
          </button>
        )}
      </div>
    </aside>
  );
};
