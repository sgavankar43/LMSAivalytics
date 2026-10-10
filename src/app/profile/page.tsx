'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useAttendance } from '@/context/AttendanceContext';
import { useCourses } from '@/context/CourseContext';
import { useEnrollment } from '@/context/EnrollmentContext';
import { mockCertificates } from '@/data/mockData';
import { CertificateItem } from '@/types';
import { CertificateModal } from '@/components/profile/CertificateModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Edit3,
  Share2,
  ArrowRight,
  Eye,
  Layers,
  GraduationCap,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { getStudentAttendance } = useAttendance();
  const {
    courses,
    courseProgress,
    totalLessons,
    completedLessonsCount,
    modules,
    isLessonCompleted,
  } = useCourses();
  const { students } = useEnrollment();
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  // Modal states
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateItem | null>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [certStatusFilter, setCertStatusFilter] = useState<'All' | 'Issued' | 'Pending'>('All');

  const studentEmail = user?.email || '';
  const attendanceStats = getStudentAttendance(studentEmail);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCertificate = (cert: CertificateItem) => {
    setSelectedCertificate(cert);
    setIsCertificateModalOpen(true);
  };

  const handleShareProfile = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      showToast('Profile verification link copied to clipboard!');
    }
  };

  // Dynamic user credentials based on real curriculum completion
  const dynamicCertificates: CertificateItem[] = React.useMemo(() => {
    const mod1Completed =
      modules[0] &&
      modules[0].submodules.length > 0 &&
      modules[0].submodules.every((s) => isLessonCompleted(s.id));
    const mod2Completed =
      modules[1] &&
      modules[1].submodules.length > 0 &&
      modules[1].submodules.every((s) => isLessonCompleted(s.id));
    const mod3Completed =
      modules[2] &&
      modules[2].submodules.length > 0 &&
      modules[2].submodules.every((s) => isLessonCompleted(s.id));

    const studentSuffix = user?.id ? user.id.slice(0, 4).toUpperCase() : 'STD';

    return [
      {
        id: 'cert_1',
        title: 'AI Foundations Certified',
        issueDate: mod1Completed ? 'Recently Issued' : 'Target: Month 1',
        credentialId: mod1Completed
          ? `AIV-CERT-2026-FND-${studentSuffix}`
          : 'AIV-CERT-2026-FND-PENDING',
        status: mod1Completed ? 'Issued' : 'Pending',
        grade: mod1Completed ? '100% (Distinction)' : 'In Progress',
        program: 'AI-Native Project Management Program',
        issuer: 'AIvalytics Senate & Curriculum Board',
        description:
          'Verified mastery in modern LLM reasoning, tokens, context windows, CTID & CO-STAR frameworks, SOP engineering, and single-agent architecture.',
        skills: ['Context Engineering', 'CTID Framework', 'SOP Engineering', 'AI Builder Stack', 'Agent Architecture'],
      },
      {
        id: 'cert_2',
        title: 'AI Agents & Orchestration Certified',
        issueDate: mod2Completed ? 'Recently Issued' : 'Target: Month 2',
        credentialId: mod2Completed
          ? `AIV-CERT-2026-AGN-${studentSuffix}`
          : 'AIV-CERT-2026-AGN-PENDING',
        status: mod2Completed ? 'Issued' : 'Pending',
        grade: mod2Completed ? '100% (Distinction)' : 'In Progress',
        program: 'AI-Native Project Management Program',
        issuer: 'AIvalytics Senate & Curriculum Board',
        description:
          'Design and deployment of multi-agent business automation topologies, webhook error boundaries, n8n production workflows, and enterprise RAG pipelines.',
        skills: ['Multi-Agent Systems', 'n8n Orchestration', 'RAG Architecture', 'Webhooks', 'Memory Systems'],
      },
      {
        id: 'cert_3',
        title: 'AI-Native Project Management Certified (Executive Capstone)',
        issueDate: mod3Completed ? 'Recently Issued' : 'Target: Month 3',
        credentialId: mod3Completed
          ? `AIV-CERT-2026-NPM-${studentSuffix}`
          : 'AIV-CERT-2026-NPM-PENDING',
        status: mod3Completed ? 'Issued' : 'Pending',
        grade: mod3Completed ? '100% (Distinction)' : 'In Progress',
        program: 'AI-Native Project Management Program',
        issuer: 'AIvalytics Senate & Curriculum Board',
        description:
          'Execution leadership, Tiered Autonomy Framework, Narrow-First Playbook, LLM-as-a-Judge validation, and live defense of production AI-native project.',
        skills: ['Tiered Autonomy', 'Narrow-First Playbook', 'LLM-as-a-Judge', 'Delivery Governance', 'GTM Execution'],
      },
    ];
  }, [modules, isLessonCompleted, user]);

  // Filtered certificates
  const filteredCertificates = dynamicCertificates.filter((cert) => {
    if (certStatusFilter === 'All') return true;
    return cert.status === certStatusFilter;
  });

  // Overall completed courses
  const totalCourses = courses.length;
  const issuedCertsCount = dynamicCertificates.filter((c) => c.status === 'Issued').length;
  const inProgressCertsCount = dynamicCertificates.filter((c) => c.status === 'Pending').length;

  return (
    <AppShell>
      <div className="space-y-7 max-w-7xl mx-auto pb-16">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#121614] text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="w-6 h-6 rounded-full bg-[#3ECE92]/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Breadcrumb & Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
              <Link href="/" className="hover:text-gray-700 transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My Profile & Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111614]">
              {isAdmin ? 'Faculty Administrator Profile' : 'Student Profile & Academic Standing'}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isAdmin
                ? 'Manage your institutional faculty credentials, curriculum direction, and administrator account details.'
                : 'Manage your personal record, enrolled course syllabus, and official program certifications.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShareProfile}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Share Profile</span>
            </button>

            <button
              onClick={() => setIsEditModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34be83] transition-colors shadow-sm active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* 1. Hero Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-bl from-[#e8f8f0]/80 via-transparent to-transparent pointer-events-none rounded-tr-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6 sm:gap-8">
            {/* Left: Avatar & Identity Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
              {/* Avatar with Status Ring */}
              <div className="relative shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#121614] text-[#3ECE92] flex items-center justify-center font-extrabold text-2xl sm:text-3xl shadow-lg border-2 border-white">
                  {user?.initials || (isAdmin ? 'AF' : 'LM')}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#3ECE92] border-3 border-white flex items-center justify-center shadow-xs"
                  title="Active Session"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              </div>

              {/* Names and Badges */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#111614] tracking-tight">
                    {user?.name || (isAdmin ? 'Admin Faculty' : 'Learner')}
                  </h2>

                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize bg-purple-50 text-purple-700 border border-purple-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Faculty Administrator</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]">
                      <GraduationCap className="w-3.5 h-3.5 text-[#059669]" />
                      <span>Learner Account</span>
                    </span>
                  )}

                  {user?.studentId && (
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                      ID: {user.studentId}
                    </span>
                  )}

                  {user?.department && (
                    <span className="text-[11px] font-semibold text-gray-600 bg-gray-50 px-2.5 py-0.5 rounded-md border border-gray-200">
                      {user.department}
                    </span>
                  )}
                </div>

                {user?.headline && (
                  <p className="text-xs sm:text-sm font-medium text-gray-700 leading-snug">
                    {user.headline}
                  </p>
                )}

                {user?.bio && (
                  <p className="text-xs text-gray-500 max-w-2xl leading-relaxed pt-1">
                    {user.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Key Contact & Metadata Chips (Only fields that are actually filled) */}
            <div className="bg-[#f8faf9] rounded-2xl p-4 sm:p-5 border border-[#eaedf0] shrink-0 w-full lg:w-80 space-y-2.5">
              {user?.email && (
                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                    Verified
                  </span>
                </div>
              )}

              {user?.phone && (
                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{user.phone}</span>
                </div>
              )}

              {user?.location && (
                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{user.location}</span>
                </div>
              )}

              {user?.joinedDate && (
                <div className="flex items-center gap-2.5 text-xs text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{isAdmin ? 'Joined:' : 'Enrolled:'} {user.joinedDate}</span>
                </div>
              )}

              {(user?.cohort || user?.term) && (
                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>{isAdmin ? 'Department / Board:' : 'Cohort:'}</span>
                  <span className="font-semibold text-gray-800">{user.cohort || user.term}</span>
                </div>
              )}
            </div>
          </div>

          {/* Highlights & Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 pt-6 border-t border-gray-100">
            {isAdmin ? (
              <>
                <div className="bg-[#f8faf9] rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Administrative Clearance
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-gray-900">Faculty Director</span>
                    <span className="text-[10px] text-purple-700 font-semibold bg-purple-50 px-1.5 py-0.5 rounded">Full Access</span>
                  </div>
                </div>

                <div className="bg-[#f8faf9] rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Curriculum In Charge
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-gray-900">AINPM-101</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Flagship Program</span>
                  </div>
                </div>

                <div className="bg-[#f8faf9] rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Institutional Capacity
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-gray-900">{students.length} Enrolled</span>
                    <span className="text-[10px] text-gray-400">Learners</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-[#f8faf9] rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#059669]" />
                    Live Attendance
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-gray-900">
                      {attendanceStats.percentage}%
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({attendanceStats.attendedSessions}/{attendanceStats.totalSessions} sessions)
                    </span>
                  </div>
                </div>

                <div className="bg-[#f8faf9] rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Enrolled Program
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-gray-900">{totalCourses} Course</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Active Enrollment</span>
                  </div>
                </div>

                <div className="bg-[#f8faf9] rounded-2xl p-3.5 border border-gray-100">
                  <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Certifications
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-gray-900">
                      {issuedCertsCount} Earned
                    </span>
                    <span className="text-[10px] text-gray-400">
                      ({inProgressCertsCount} in progress)
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. My Courses Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#111614]">
                  Enrolled Program & Syllabus
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {courses.length} Program
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Track curriculum completion milestones, assigned instructors, and next upcoming lecture topics.
              </p>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => {
              const displayProgress = courses.length === 1 ? courseProgress : (course.progress ?? 0);
              const displayCompletedLessons = courses.length === 1 ? completedLessonsCount : (course.completedLessons ?? 0);
              const displayTotalLessons = courses.length === 1 ? totalLessons : (course.totalLessons ?? 0);
              const displayCompletedModules = modules.filter((m) => m.submodules.length > 0 && m.submodules.every((s) => s.isCompleted)).length;
              const displayTotalModules = modules.length || course.totalModules || 3;

              return (
                <div
                  key={course.id}
                  className="bg-[#f8faf9] rounded-2xl p-5 border border-gray-200/70 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Tags */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-[#059669] bg-[#e8f8f0] px-2.5 py-0.5 rounded-md border border-[#d1f4e2]">
                        {course.code}
                      </span>
                      <span className="text-[10px] font-medium text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {course.category}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#059669] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-gray-600">
                      <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-[10px] flex items-center justify-center">
                        {(course.instructor || 'AF').split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{course.instructor || 'Admin Faculty'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{course.instructorRole || 'Curriculum Lead'}</p>
                      </div>
                    </div>

                    {/* Progress Bar & Metric */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-500">Curriculum Progress</span>
                        <span className="font-bold text-gray-900">{displayProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200/80 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#3ECE92] h-full rounded-full transition-all duration-500"
                          style={{ width: `${displayProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-mono">
                        <span>{displayCompletedModules} / {displayTotalModules} modules</span>
                        <span>{displayCompletedLessons} / {displayTotalLessons} lessons</span>
                      </div>
                    </div>

                    {/* Next Lesson Box */}
                    {course.nextLesson && (
                      <div className="bg-white rounded-xl p-2.5 border border-gray-200/80 text-[11px] text-gray-600 flex items-start gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#059669] mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 block truncate">
                            Next Up:
                          </span>
                          <span className="text-gray-500 truncate block">{course.nextLesson}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 mt-4 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400">{course.totalHours || '16h 40m'}</span>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#059669] hover:text-[#047857] transition-colors"
                    >
                      <span>Resume Course</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Program Certifications & Verified Credentials Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#111614]">
                  Program Certifications & Verified Credentials
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {issuedCertsCount} Verified
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Official credentials issued upon completing curriculum modules, milestone tests, and faculty-guided project submissions.
              </p>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5">
              {(['All', 'Issued', 'Pending'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setCertStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    certStatusFilter === status
                      ? 'bg-[#121614] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status === 'All'
                    ? `All Credentials (${dynamicCertificates.length})`
                    : status === 'Issued'
                    ? `Issued (${issuedCertsCount})`
                    : `In Progress (${inProgressCertsCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Certificates List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredCertificates.map((cert) => {
              const isIssued = cert.status === 'Issued';

              return (
                <div
                  key={cert.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isIssued
                      ? 'bg-gradient-to-b from-white to-[#f0faf5] border-[#d1f4e2] shadow-[0_4px_16px_rgba(62,206,146,0.06)]'
                      : 'bg-[#fcfdfd] border-gray-200/80 shadow-2xs'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Top Row: Badge & Program */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isIssued
                            ? 'bg-[#3ECE92]/20 text-[#059669] border border-[#3ECE92]/40'
                            : 'bg-amber-100/70 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {isIssued ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                            <span>Issued & Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>Curriculum In Progress</span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] font-mono text-gray-400">
                        {isIssued ? cert.issueDate : 'Target: Fall 2026'}
                      </span>
                    </div>

                    {/* Certificate Title */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {cert.title}
                      </h3>
                      <p className="text-[11px] font-mono text-gray-400 mt-1">
                        ID: {cert.credentialId}
                      </p>
                    </div>

                    {/* Honors / Grade Pill */}
                    <div className="bg-white/80 rounded-xl p-2.5 border border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-medium text-gray-500">Evaluation:</span>
                      <span className="text-[11px] font-bold text-[#059669]">{cert.grade}</span>
                    </div>

                    {/* Description */}
                    {cert.description && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {cert.description}
                      </p>
                    )}

                    {/* Skills Tags */}
                    {cert.skills && cert.skills.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {cert.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] font-medium bg-white text-gray-600 px-2 py-0.5 rounded-md border border-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="pt-4 mt-4 border-t border-gray-200/60 flex items-center gap-2">
                    {isIssued ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenCertificate(cert)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34be83] transition-colors shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCertificate(cert)}
                          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-200 transition-colors"
                          title="Print or Save PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/assessments"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        <span>View Project Rubrics</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          certificate={selectedCertificate}
          user={user}
        />

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSaveSuccess={(msg) => showToast(msg)}
        />
      </div>
    </AppShell>
  );
}
