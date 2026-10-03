'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useEnrollment } from '@/context/EnrollmentContext';
import { CsvUserImportModal } from '@/components/admin/CsvUserImportModal';
import { ImportedStudent } from '@/types';
import {
  Users,
  Search,
  Upload,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  GraduationCap,
  ShieldCheck,
  TrendingUp,
  BookOpen,
  UserPlus,
  AlertCircle,
  MoreVertical,
  Check,
} from 'lucide-react';

export default function EnrollmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    students,
    totalEnrolled,
    activeCount,
    pendingCount,
    importStudents,
    deleteStudent,
    toggleStudentStatus,
    exportStudentsToCsv,
  } = useEnrollment();

  const isAdmin = user?.role === 'admin';

  // Guard: Redirect non-admins to Dashboard
  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, router]);

  // Modal & Toast state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Active' | 'Pending'>('All');

  // Handle URL deep-linking (?action=import)
  const initialUrlHandled = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || initialUrlHandled.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'import') {
      setIsImportModalOpen(true);
      initialUrlHandled.current = true;
      window.history.replaceState({}, '', '/enrollment');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleImportSuccess = (newStudents: ImportedStudent[]) => {
    importStudents(newStudents);
    showToast(`Successfully enrolled ${newStudents.length} students via CSV.`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from enrollment records?`)) {
      deleteStudent(id);
      showToast(`Removed ${name} from cohort enrollment.`);
    }
  };

  const handleToggle = (id: string, name: string) => {
    toggleStudentStatus(id);
    showToast(`Updated enrollment status for ${name}.`);
  };

  // Filtered student list
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      s.courseName.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    const matchesCourse = selectedCourse === 'All' || s.courseCode === selectedCourse;
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (!isAdmin) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center p-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Enrollment and admissions management is restricted to authorized faculty and administrators. Redirecting...
          </p>
          <Link
            href="/"
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#121614] hover:bg-black transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#121614] text-white px-4 py-3 rounded-2xl shadow-2xl border border-gray-800 flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <div className="w-6 h-6 rounded-full bg-[#3ECE92]/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#3ECE92]" />
            </div>
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Header Banner & Action Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-[#e8f8f0] text-[#059669] border border-[#d1f4e2]">
                <Users className="w-3.5 h-3.5" />
                Cohort Enrollment & Admissions Management
              </span>
              <span className="text-xs text-gray-400 font-mono">• Fall 2026 Term</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111614]">
              Student Enrollment & Cohort Directory
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
              Manage admitted students, bulk enroll learners via CSV spreadsheets, track course allocations, and maintain cohort rosters.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={exportStudentsToCsv}
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-2xs"
              title="Download Current Roster as CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export Roster CSV</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#111614] bg-[#3ECE92] hover:bg-[#34be83] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Bulk Enroll via CSV</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Enrolled */}
          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Total Enrolled Students</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {totalEnrolled}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  +{students.length} from directory
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Across all active program cohorts</p>
            </div>
          </div>

          {/* Active Learners */}
          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Active Learners</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {activeCount}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  In Good Standing
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Full access to live seminars & tests</p>
            </div>
          </div>

          {/* Pending Invitations */}
          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Pending Activation</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {pendingCount}
                </span>
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  Awaiting Confirmation
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Invitation link dispatched via email</p>
            </div>
          </div>

          {/* Courses Allocated */}
          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Active Program Courses</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">3 Courses</span>
                <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  Fall 2026
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">ACA-101 • BRM-204 • AML-305</p>
            </div>
          </div>
        </div>

        {/* Main Enrollment Directory Table */}
        <div className="bg-white rounded-3xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          {/* Table Toolbar & Filtration Controls */}
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">Enrolled Student Directory</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {filteredStudents.length} Students
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Inspect admitted student records, assign course allocations, and manage active roster status.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs pl-8 pr-3 py-2 bg-[#f8faf9] rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] w-48 sm:w-60"
                />
              </div>

              {/* Course Selector Filter */}
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="text-xs py-2 px-3 bg-[#f8faf9] rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] text-gray-700"
              >
                <option value="All">All Courses</option>
                <option value="ACA-101">ACA-101 (Academic Info)</option>
                <option value="BRM-204">BRM-204 (Business Research)</option>
                <option value="AML-305">AML-305 (Applied AI)</option>
              </select>

              {/* Status Selector Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'All' | 'Active' | 'Pending')}
                className="text-xs py-2 px-3 bg-[#f8faf9] rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] text-gray-700"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Pending">Pending Only</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#f8faf9]/70 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Course Allocation</th>
                  <th className="py-3.5 px-6">Cohort Term</th>
                  <th className="py-3.5 px-6">Enrolled Date</th>
                  <th className="py-3.5 px-6">Enrollment Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="text-sm font-semibold text-gray-600">No student enrollment records found</p>
                        <p className="text-xs text-gray-400">
                          Try adjusting your search terms or upload a new cohort roster via CSV.
                        </p>
                        <button
                          onClick={() => setIsImportModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#3ECE92]" />
                          <span>Import Students Now</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const isActive = student.status === 'Active';
                    const initials = student.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                        {/* Student Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#121614] text-[#3ECE92] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 truncate">{student.fullName}</p>
                              <p className="text-[11px] text-gray-400 font-mono truncate">{student.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Student ID */}
                        <td className="py-4 px-6 font-mono text-[11px] text-gray-500">
                          {student.id.toUpperCase()}
                        </td>

                        {/* Course Code & Name */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#059669] bg-[#e8f8f0] px-2 py-0.5 rounded-md w-fit border border-[#d1f4e2]">
                              <GraduationCap className="w-3 h-3" />
                              {student.courseCode}
                            </span>
                            <span className="text-[11px] text-gray-500 truncate max-w-[200px]">
                              {student.courseName}
                            </span>
                          </div>
                        </td>

                        {/* Term */}
                        <td className="py-4 px-6 font-medium text-gray-700">
                          {student.term}
                        </td>

                        {/* Enrolled Date */}
                        <td className="py-4 px-6 text-gray-400 font-mono text-[11px]">
                          {student.enrolledAt}
                        </td>

                        {/* Status with Toggle Action */}
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => handleToggle(student.id, student.fullName)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            }`}
                            title="Click to toggle status"
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggle(student.id, student.fullName)}
                              type="button"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                              title={isActive ? 'Mark as Pending' : 'Mark as Active'}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(student.id, student.fullName)}
                              type="button"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Student Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-[#f8faf9] border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredStudents.length} of {students.length} directory records ({totalEnrolled} total institutional cohort capacity)
            </span>
            <span className="font-mono text-[11px] text-gray-400">
              CSV Auto-Validated Engine
            </span>
          </div>
        </div>

        {/* CSV User Import Modal */}
        <CsvUserImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportStudents={handleImportSuccess}
        />
      </div>
    </AppShell>
  );
}
