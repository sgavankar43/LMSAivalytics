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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

  // Search Registry
  const searchItems: SearchItem[] = useMemo(() => [
    // --- Pages & Workspaces ---
    {
      id: 'page_dashboard',
      title: 'Dashboard Overview',
      description: 'Learner summary, metrics, live sessions & attendance stack',
      category: 'Pages',
      href: '/',
      keywords: ['dashboard', 'home', 'overview', 'summary', 'stats', 'analytics', 'classes'],
      icon: LayoutDashboard,
      badge: 'Main',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: true,
    },
    {
      id: 'page_courses',
      title: 'My Courses & Curriculum',
      description: 'Enrolled courses, active modules, syllabus and study materials',
      category: 'Pages',
      href: '/courses',
      keywords: ['courses', 'curriculum', 'classes', 'syllabus', 'modules', 'study', 'lessons'],
      icon: BookOpen,
      badge: 'Academic',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      recommended: true,
    },
    {
      id: 'page_assessments',
      title: 'Assessments & Project Submissions',
      description: 'Guided project deliverables, milestone submissions, and review statuses',
      category: 'Pages',
      href: '/assessments',
      keywords: ['assessments', 'projects', 'submissions', 'homework', 'deliverables', 'milestones'],
      icon: FileCheck,
      badge: 'Projects',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: true,
    },
    {
      id: 'page_quizzes',
      title: 'Quizzes & Knowledge Checks',
      description: 'Timed module quizzes, comprehension checks, and review attempts',
      category: 'Pages',
      href: '/assessments?tab=quizzes',
      keywords: ['quiz', 'quizzes', 'tests', 'knowledge checks', 'exam', 'multiple choice'],
      icon: Award,
      badge: 'Quiz',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: true,
    },
    {
      id: 'page_support',
      title: 'Support & Help Desk',
      description: 'Submit tickets, contact faculty, view real-time resolutions',
      category: 'Pages',
      href: '/support',
      keywords: ['support', 'help', 'tickets', 'issues', 'assistance', 'inquiry', 'helpdesk', 'resolution'],
      icon: Ticket,
      badge: 'Help Desk',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      recommended: true,
    },
    {
      id: 'page_performance',
      title: 'Performance & Academic Progress',
      description: 'GPA metrics, weekly study activity, and course completion rates',
      category: 'Pages',
      href: '/performance',
      keywords: ['performance', 'gpa', 'grades', 'progress', 'analytics', 'completion', 'activity', 'hours'],
      icon: BarChart2,
      badge: 'Analytics',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      recommended: true,
    },
    {
      id: 'page_events',
      title: 'Events & Live Seminars',
      description: 'Schedule of live classes, faculty office hours, and webinars',
      category: 'Pages',
      href: '/events',
      keywords: ['events', 'seminars', 'calendar', 'schedule', 'webinars', 'live', 'office hours', 'classes'],
      icon: Calendar,
      badge: 'Live',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      recommended: true,
    },
    {
      id: 'page_attendance',
      title: 'Attendance Records & Reflection Logs',
      description: 'Track live attendance, absences, and personal lecture takeaways',
      category: 'Pages',
      href: '/attendance',
      keywords: ['attendance', 'presence', 'absent', 'late', 'sessions', 'reflections', 'logs', 'stack'],
      icon: CheckCircle2,
      badge: 'Records',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      recommended: false,
    },
    {
      id: 'page_profile',
      title: 'My Profile & Credentials',
      description: 'Academic identity, cohort details, bio, and student credentials',
      category: 'Pages',
      href: '/profile',
      keywords: ['profile', 'account', 'student id', 'bio', 'credentials', 'alex morgan', 'settings', 'details'],
      icon: User,
      badge: 'Profile',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      recommended: false,
    },
    {
      id: 'page_enrollment',
      title: 'Cohort Enrollment Status',
      description: 'Registration status and executive certification program roadmap',
      category: 'Pages',
      href: '/enrollment',
      keywords: ['enrollment', 'register', 'cohort', 'term', 'admission', 'roadmap'],
      icon: ShieldCheck,
      badge: 'Cohort',
      badgeColor: 'bg-gray-100 text-gray-700 border-gray-200',
      recommended: false,
    },

    // --- Courses & Subjects ---
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
    },

    // --- Assessments & Projects ---
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
    },

    // --- Quick Actions & Tools ---
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
    },
    {
      id: 'action_switch_role',
      title: `Switch Role (Current: ${user?.role === 'admin' ? 'Faculty Admin' : 'Learner'})`,
      description: 'Toggle views between Learner (Alex Morgan) and Faculty Admin perspective',
      category: 'Actions',
      action: () => switchRole(user?.role === 'admin' ? 'learner' : 'admin'),
      keywords: ['switch role', 'admin', 'learner', 'faculty', 'toggle role', 'role', 'alex morgan'],
      icon: RefreshCw,
      badge: 'Toggle',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      recommended: true,
    },
    {
      id: 'action_join_live',
      title: 'Join Upcoming Live Session',
      description: 'Open schedule and join active Google Meet classroom sessions',
      category: 'Actions',
      href: '/events',
      keywords: ['join live', 'live class', 'meet', 'gmeet', 'webinar', 'stream', 'call'],
      icon: Calendar,
      badge: 'Action',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      recommended: false,
    },
    {
      id: 'action_take_quiz',
      title: 'Start Module Quiz / Test',
      description: 'Launch immediate knowledge check questions and check scores',
      category: 'Actions',
      href: '/assessments?tab=quizzes',
      keywords: ['take quiz', 'start test', 'test', 'exam'],
      icon: Award,
      badge: 'Action',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      recommended: false,
    },
  ], [user?.role, switchRole]);

  // Filtered Results or Recommendations
  const displayedItems = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      // Recommendations when query is empty: return items marked as recommended
      return searchItems.filter((item) => item.recommended);
    }

    return searchItems.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(cleanQuery);
      const matchDesc = item.description.toLowerCase().includes(cleanQuery);
      const matchCategory = item.category.toLowerCase().includes(cleanQuery);
      const matchKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(cleanQuery));
      return matchTitle || matchDesc || matchCategory || matchKeywords;
    });
  }, [query, searchItems]);

  // Keep selected index within valid range
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayedItems]);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K and Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K to open search
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

  // Execution / Routing Handler
  const handleSelect = (item: SearchItem) => {
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
      setSelectedIndex((prev) => (prev + 1) % displayedItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + displayedItems.length) % displayedItems.length);
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
          placeholder="Search pages, courses, actions... (⌘K)"
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
                  <span className="text-gray-700 font-semibold">Recommended & Quick Navigation</span>
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
            <span className="text-[11px] text-gray-400">Jump anywhere</span>
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
                  No matching destinations for &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Try searching for <span className="font-semibold text-gray-600">courses</span>, <span className="font-semibold text-gray-600">assessments</span>, <span className="font-semibold text-gray-600">support</span>, or <span className="font-semibold text-gray-600">attendance</span>.
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
            <span className="font-medium text-gray-400 hidden sm:inline">AIvalytics Navigation</span>
          </div>
        </div>
      )}
    </div>
  );
};
