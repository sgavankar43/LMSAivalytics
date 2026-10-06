'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  BookOpen,
  FileCheck,
  Award,
  Ticket,
  BarChart2,
  Calendar,
  CheckCircle2,
  User,
  ShieldCheck,
  Sparkles,
  FolderKanban,
  RefreshCw,
  ArrowRight,
  CornerDownLeft,
  X,
  Compass,
  Zap,
  UserCheck,
  Users,
  Video,
  UserPlus,
  BellRing,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: 'Pages' | 'Courses' | 'Assessments' | 'Actions';
  href?: string;
  keywords: string[];
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  action?: () => void;
  recommended?: boolean;
  allowedRoles: UserRole[];
}

export const GlobalSearchBar: React.FC = () => {
  const router = useRouter();
  const { user, switchRole } = useAuth();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const currentRole: UserRole = user?.role === 'admin' ? 'admin' : 'learner';

  // Comprehensive Search Registry with Strict Role Tagging
  const allSearchItems: SearchItem[] = useMemo(() => [
    // ==========================================
    // 1. LEARNER-EXCLUSIVE PAGES & ACTIONS
    // ==========================================
    {
      id: 'page_dashboard_learner',
      title: 'Learner Dashboard Overview',
      description: 'Your learning metrics, live lectures, weekly activity & attendance stack',
      category: 'Pages',
      href: '/',
      keywords: ['dashboard', 'home', 'overview', 'metrics', 'sessions', 'attendance', 'alex morgan', 'student'],
      icon: LayoutDashboard,
      badge: 'Learner',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: true,
      allowedRoles: ['learner'],
    },
    {
      id: 'page_assessments_learner',
      title: 'Assessments & Project Submissions',
      description: 'Submit guided project deliverables, milestone files and view grades',
      category: 'Pages',
      href: '/assessments',
      keywords: ['assessments', 'projects', 'submissions', 'homework', 'deliverables', 'milestones', 'upload'],
      icon: FileCheck,
      badge: 'Deliverables',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: true,
      allowedRoles: ['learner'],
    },
    {
      id: 'page_quizzes_learner',
      title: 'Timed Quizzes & Knowledge Checks',
      description: 'Take module quizzes, timed comprehension tests and review scored attempts',
      category: 'Pages',
      href: '/assessments?tab=quizzes',
      keywords: ['quiz', 'quizzes', 'tests', 'knowledge checks', 'exam', 'multiple choice', 'scores'],
      icon: Award,
      badge: 'Quizzes',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: true,
      allowedRoles: ['learner'],
    },
    {
      id: 'page_support_learner',
      title: 'Learner Support & Academic Helpdesk',
      description: 'Submit inquiries, contact faculty and track real-time resolution remarks',
      category: 'Pages',
      href: '/support',
      keywords: ['support', 'help', 'tickets', 'issues', 'assistance', 'inquiry', 'helpdesk', 'resolution'],
      icon: Ticket,
      badge: 'Help Desk',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      recommended: true,
      allowedRoles: ['learner'],
    },
    {
      id: 'page_profile_learner',
      title: 'My Profile & Academic Credentials',
      description: 'Student identity, GPA, enrolled cohort, and verified certificates',
      category: 'Pages',
      href: '/profile',
      keywords: ['profile', 'account', 'student id', 'bio', 'credentials', 'certifications', 'alex morgan', 'settings'],
      icon: User,
      badge: 'Profile',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      recommended: false,
      allowedRoles: ['learner'],
    },
    {
      id: 'page_student_attendance',
      title: 'My Attendance & Lecture Reflections',
      description: 'Review your live lecture attendance record and submitted reflection notes',
      category: 'Pages',
      href: '/',
      keywords: ['attendance', 'reflections', 'present', 'absent', 'sessions', 'lecture notes', 'reflection stack'],
      icon: CheckCircle2,
      badge: 'Attendance',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: false,
      allowedRoles: ['learner'],
    },
    {
      id: 'action_new_ticket',
      title: 'Raise New Support Ticket',
      description: 'Submit an academic, technical, or portal inquiry directly to faculty',
      category: 'Actions',
      href: '/support?action=new',
      keywords: ['new ticket', 'create ticket', 'raise ticket', 'contact faculty', 'help', 'report issue', 'bug'],
      icon: Ticket,
      badge: 'Action',
      badgeColor: 'bg-[#121614] text-white border-transparent',
      recommended: true,
      allowedRoles: ['learner'],
    },
    {
      id: 'action_take_quiz',
      title: 'Start Module Quiz / Test',
      description: 'Launch immediate knowledge check questions and check scores',
      category: 'Actions',
      href: '/assessments?tab=quizzes',
      keywords: ['take quiz', 'start test', 'test', 'exam', 'quiz'],
      icon: Award,
      badge: 'Action',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: false,
      allowedRoles: ['learner'],
    },
    {
      id: 'assess_mod1',
      title: 'Module 1: AI Foundations',
      description: 'Weeks 1–4 • LLM reasoning, tokens, context engineering and SOP design',
      category: 'Assessments',
      href: '/assessments',
      keywords: ['module 1', 'foundations', 'tokens', 'reasoning', 'sop', 'prompting', 'ctid'],
      icon: FolderKanban,
      badge: 'Module 1',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: true,
      allowedRoles: ['learner'],
    },
    {
      id: 'assess_sub1_1',
      title: 'Context Engineering & SOP Blueprint (Subpart 1.1)',
      description: 'Due Oct 12 • Machine-readable SOPs with CTID & CO-STAR frameworks',
      category: 'Assessments',
      href: '/assessments',
      keywords: ['1.1', 'sop blueprint', 'context engineering', 'ctid', 'co-star', 'deliverable', 'blueprint'],
      icon: FileCheck,
      badge: 'Deliverable',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: false,
      allowedRoles: ['learner'],
    },
    {
      id: 'assess_sub1_2',
      title: 'Production AI Agent Architecture (Subpart 1.2)',
      description: 'Due Oct 19 • Single-agent systems, role prompting & structured JSON',
      category: 'Assessments',
      href: '/assessments',
      keywords: ['1.2', 'agent architecture', 'system prompts', 'json output', 'deliverable', 'single agent'],
      icon: FileCheck,
      badge: 'Deliverable',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: false,
      allowedRoles: ['learner'],
    },
    {
      id: 'assess_quiz_mod1',
      title: 'AI Foundations Milestone Quiz',
      description: '10 Questions • 15 Minutes • Evaluates prompt engineering and tokenization',
      category: 'Assessments',
      href: '/assessments?tab=quizzes',
      keywords: ['quiz 1', 'knowledge check', 'ai foundations quiz', 'test', 'exam'],
      icon: Award,
      badge: 'Timed Quiz',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      recommended: false,
      allowedRoles: ['learner'],
    },

    // ==========================================
    // 2. ADMIN-EXCLUSIVE PAGES & ACTIONS (Secured)
    // ==========================================
    {
      id: 'page_admin_dashboard',
      title: 'Faculty & Admin Dashboard',
      description: 'Institution analytics, lecture management, faculty tasks & broadcast center',
      category: 'Pages',
      href: '/',
      keywords: ['dashboard', 'admin', 'faculty', 'overview', 'governance', 'institution', 'management'],
      icon: LayoutDashboard,
      badge: 'Admin Console',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'page_attendance_admin',
      title: 'Session Attendance & Cohort Rosters',
      description: 'Administrative attendance console: mark rosters, view presence rates & schedule lectures',
      category: 'Pages',
      href: '/attendance',
      keywords: ['attendance', 'roster', 'students', 'mark attendance', 'cohort', 'present', 'absent', 'late', 'sessions'],
      icon: UserCheck,
      badge: 'Admin Console',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'page_enrollment_admin',
      title: 'Student Enrollment & Cohort Directory',
      description: 'Admissions management, active student directory, CSV roster import & exports',
      category: 'Pages',
      href: '/enrollment',
      keywords: ['enrollment', 'students', 'admissions', 'csv', 'import', 'roster', 'cohort directory', 'users'],
      icon: Users,
      badge: 'Admin Roster',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'page_assessments_admin',
      title: 'Assessment & Project Review Desk',
      description: 'Evaluate student project deliverables, assign grades, audit quiz statistics',
      category: 'Pages',
      href: '/assessments',
      keywords: ['assessments', 'grading', 'review', 'submissions', 'faculty audit', 'rubric', 'evaluation', 'review desk'],
      icon: FileCheck,
      badge: 'Admin Review',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'page_support_admin',
      title: 'Faculty Support Resolution Center',
      description: 'Manage open student tickets across cohorts, submit remarks & resolve issues',
      category: 'Pages',
      href: '/support',
      keywords: ['support', 'tickets', 'resolution', 'helpdesk', 'under review', 'faculty remarks', 'closed', 'console'],
      icon: Ticket,
      badge: 'Resolution Desk',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'action_schedule_lecture',
      title: 'Schedule New Lecture Session',
      description: 'Schedule live lecture with Google Meet link, set cohort duration & publish',
      category: 'Actions',
      href: '/attendance?action=schedule',
      keywords: ['schedule lecture', 'new session', 'google meet', 'create class', 'live lecture', 'calendar'],
      icon: Video,
      badge: 'Admin Action',
      badgeColor: 'bg-[#121614] text-white border-transparent',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'action_import_csv',
      title: 'Bulk Import Students via CSV',
      description: 'Upload learner roster CSV file to automatically register cohort students',
      category: 'Actions',
      href: '/enrollment?action=import',
      keywords: ['import students', 'csv upload', 'bulk admission', 'roster upload', 'enrollment'],
      icon: UserPlus,
      badge: 'Admin Action',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'action_upload_quiz_bank',
      title: 'Upload CSV Quiz Question Bank',
      description: 'Upload structured questions and publish automated milestone tests',
      category: 'Actions',
      href: '/assessments?tab=quizzes',
      keywords: ['quiz upload', 'csv questions', 'question bank', 'new quiz', 'create test'],
      icon: Award,
      badge: 'Admin Action',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: false,
      allowedRoles: ['admin'],
    },
    {
      id: 'action_compose_broadcast',
      title: 'Compose System Announcement',
      description: 'Publish high-priority broadcast notification to all students or specific courses',
      category: 'Actions',
      href: '/',
      keywords: ['broadcast', 'announcement', 'bulletin', 'notify students', 'alert', 'message'],
      icon: BellRing,
      badge: 'Admin Action',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      recommended: true,
      allowedRoles: ['admin'],
    },
    {
      id: 'action_switch_to_learner',
      title: 'Switch to Learner View (Alex Morgan)',
      description: 'Simulate learner perspective to verify student experience and submissions',
      category: 'Actions',
      action: () => switchRole('learner'),
      keywords: ['switch role', 'learner view', 'alex morgan', 'preview student', 'simulate learner'],
      icon: RefreshCw,
      badge: 'Role Toggle',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      recommended: true,
      allowedRoles: ['admin'],
    },

    // ==========================================
    // 3. SHARED ACADEMIC RESOURCES (Learner & Admin)
    // ==========================================
    {
      id: 'page_courses',
      title: 'Courses & Curriculum',
      description: currentRole === 'admin' 
        ? 'Curriculum module oversight, course syllabi and enrolled cohorts'
        : 'Your enrolled courses, active modules, syllabus and study materials',
      category: 'Pages',
      href: '/courses',
      keywords: ['courses', 'curriculum', 'classes', 'syllabus', 'modules', 'study', 'lessons'],
      icon: BookOpen,
      badge: 'Academic',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: true,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'page_performance',
      title: 'Performance & Progress Analytics',
      description: currentRole === 'admin'
        ? 'Institutional cohort completion averages, study velocity & grade audits'
        : 'Your GPA metrics, weekly study activity, and course completion rates',
      category: 'Pages',
      href: '/performance',
      keywords: ['performance', 'gpa', 'grades', 'progress', 'analytics', 'completion', 'activity', 'hours'],
      icon: BarChart2,
      badge: 'Analytics',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      recommended: true,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'page_events',
      title: 'Events & Live Seminars',
      description: 'Calendar of live lectures, faculty office hours, and guest webinars',
      category: 'Pages',
      href: '/events',
      keywords: ['events', 'seminars', 'calendar', 'schedule', 'webinars', 'live', 'office hours', 'classes'],
      icon: Calendar,
      badge: 'Live',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      recommended: true,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'course_1',
      title: 'Academic Information & Governance (ACA-101)',
      description: 'Dean Dr. Evelyn Reed • Institutional policies, roadmaps, ethics',
      category: 'Courses',
      href: '/courses/course_1',
      keywords: ['academic', 'governance', 'evelyn', 'reed', 'aca-101', 'ethics', 'policies', 'course 1'],
      icon: BookOpen,
      badge: 'Course',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: true,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'course_2',
      title: 'Business Research Methodologies (BRM-204)',
      description: 'Dr. Sarah Jenkins • Qualitative & quantitative hypothesis testing',
      category: 'Courses',
      href: '/courses/course_2',
      keywords: ['business', 'research', 'methodologies', 'jenkins', 'brm-204', 'hypothesis', 'testing', 'course 2'],
      icon: BookOpen,
      badge: 'Course',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: false,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'course_3',
      title: 'Applied AI Systems & Architecture (AI-301)',
      description: 'Admin Faculty • LLM pipelines, autonomous agents, neural optimization',
      category: 'Courses',
      href: '/courses/course_3',
      keywords: ['applied ai', 'systems', 'neural', 'optimization', 'transformers', 'agents', 'ai-301', 'course 3'],
      icon: Sparkles,
      badge: 'Course',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      recommended: true,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'course_lecture_transformers',
      title: 'Deep Neural Optimization & Transformers',
      description: 'Session 4 • Gradient accumulation, batch sizing, attention masking',
      category: 'Courses',
      href: '/courses',
      keywords: ['neural', 'optimization', 'transformers', 'session 4', 'deep neural', 'gradient', 'attention'],
      icon: Sparkles,
      badge: 'Lecture',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: false,
      allowedRoles: ['learner', 'admin'],
    },
    {
      id: 'action_join_live',
      title: 'Join Scheduled Live Class',
      description: 'Open schedule and join active Google Meet classroom session',
      category: 'Actions',
      href: '/events',
      keywords: ['join live', 'live class', 'meet', 'gmeet', 'webinar', 'stream', 'call'],
      icon: Calendar,
      badge: 'Action',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: false,
      allowedRoles: ['learner', 'admin'],
    },
  ], [currentRole, switchRole]);

  // STRICT Role-Based Filter: Only items permitted for the current user's role can ever be returned
  const roleAuthorizedItems = useMemo(() => {
    return allSearchItems.filter((item) => item.allowedRoles.includes(currentRole));
  }, [allSearchItems, currentRole]);

  // Search Results & Recommendations Filtered Strictly by User Role
  const displayedItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      // Recommendations when query is empty: only role-authorized items marked recommended
      return roleAuthorizedItems.filter((item) => item.recommended);
    }

    return roleAuthorizedItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchDesc = item.description.toLowerCase().includes(cleanQuery);
      const matchCategory = item.category.toLowerCase().includes(cleanQuery);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery));
      return matchTitle || matchDesc || matchCategory || matchKeywords;
    });
  }, [query, roleAuthorizedItems]);

  // Keep selected index within valid range
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayedItems]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K and Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Execution / Routing Handler with Strict Permission Guard
  const handleSelect = (item: SearchItem) => {
    // Security check: ensure item is strictly permitted for current user role
    if (!item.allowedRoles.includes(currentRole)) {
      console.warn(`[Security Guard] Access denied to restricted item: ${item.id} for role: ${currentRole}`);
      return;
    }

    setIsOpen(false);
    setQuery('');

    if (item.action) {
      item.action();
      return;
    }

    if (item.href) {
      router.push(item.href);
    }
  };

  // Keyboard navigation inside input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (displayedItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (displayedItems.length || 1)) % (displayedItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (displayedItems.length > 0) {
        const itemToRoute = displayedItems[selectedIndex] || displayedItems[0];
        handleSelect(itemToRoute);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative w-full flex items-center">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder={
            currentRole === 'admin'
              ? 'Search admin portal, rosters, tools... (⌘K)'
              : 'Search pages, courses, actions... (⌘K)'
          }
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#f1f3f2] hover:bg-[#ebedec] focus:bg-white text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 rounded-xl pl-9.5 pr-14 py-2 border border-transparent focus:border-[#3ECE92] focus:ring-2 focus:ring-[#3ECE92]/20 transition-all outline-none"
          aria-label="Global navigation and site search"
        />

        {/* Right side controls: Clear or ⌘K badge */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-400 bg-white border border-gray-200 rounded-md shadow-2xs pointer-events-none">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete & Recommendations Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[320px] sm:min-w-[480px] md:min-w-[520px] max-w-xl bg-white/98 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-[#eaedf0] z-50 overflow-hidden animate-in fade-in zoom-in-98 duration-150">
          {/* Header ribbon */}
          <div className="px-4 py-2.5 bg-[#fbfcfb] border-b border-[#eaedf0] flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5 font-medium">
              {!query.trim() ? (
                <>
                  <Compass className="w-3.5 h-3.5 text-[#059669]" />
                  <span className="text-gray-700 font-semibold">
                    {currentRole === 'admin' ? 'Faculty Tools & Management' : 'Recommended & Quick Navigation'}
                  </span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#059669]" />
                  <span>
                    Search Results ({displayedItems.length})
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>{currentRole === 'admin' ? 'Faculty Admin' : 'Student'}</span>
            </div>
          </div>

          {/* Items List */}
          <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2 space-y-1 divide-y divide-gray-50">
            {displayedItems.length > 0 ? (
              displayedItems.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-[#eef8f3] text-gray-900 border border-[#cbe8d8]'
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                    }`}
                  >
                    {/* Item Icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                        isSelected
                          ? 'bg-white text-[#059669] shadow-2xs'
                          : 'bg-[#f4f6f5] text-gray-600 group-hover:bg-white group-hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold truncate text-gray-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${
                              item.badgeColor || 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    {/* Arrow / Routing indicator */}
                    <div className="shrink-0 flex items-center self-center text-gray-400 group-hover:text-[#059669] transition-colors pl-2">
                      {isSelected ? (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-[#059669] bg-white px-1.5 py-0.5 rounded border border-[#d1f4e2]">
                          <span>Enter</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      ) : (
                        <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">
                  No matching results for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  {currentRole === 'admin'
                    ? 'Try searching for rosters, enrollment, grading, or broadcasts.'
                    : 'Try searching for courses, assignments, quizzes, or support.'}
                </p>
              </div>
            )}
          </div>

          {/* Footer Guide */}
          <div className="bg-[#f8faf9] px-4 py-2 border-t border-[#eaedf0] flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">↵</kbd>
                <span>Route</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
            <span className="font-medium text-gray-400 hidden sm:inline">AIvalytics Access Control</span>
          </div>
        </div>
      )}
    </div>
  );
};
