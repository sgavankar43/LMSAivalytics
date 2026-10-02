'use client';

import React, { useState } from 'react';
import { ImportedStudent } from '@/types';
import {
  Users,
  Search,
  Upload,
  Trash2,
  Filter,
  CheckCircle2,
  Mail,
  GraduationCap,
} from 'lucide-react';

interface AdminStudentsTableProps {
  students: ImportedStudent[];
  onOpenImportModal: () => void;
  onDeleteStudent: (id: string) => void;
}

export const AdminStudentsTable: React.FC<AdminStudentsTableProps> = ({
  students,
  onOpenImportModal,
  onDeleteStudent,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('All');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === 'All' || s.courseCode === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
            <Users className="w-4 h-4 text-[#3ECE92]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Enrolled Student Directory</h3>
            <p className="text-xs text-gray-400">Manage imported learner records & active cohort status</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 bg-[#f8faf9] rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] w-40 sm:w-48"
            />
          </div>

          {/* Course filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="text-xs py-1.5 px-2.5 bg-[#f8faf9] rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92] text-gray-700"
          >
            <option value="All">All Courses</option>
            <option value="ACA-101">ACA-101</option>
            <option value="BRM-204">BRM-204</option>
            <option value="AML-305">AML-305</option>
          </select>

          {/* Import CSV trigger */}
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#3ECE92]" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-[#fafbfb]/60">
              <th className="py-3 px-6">Student</th>
              <th className="py-3 px-6">Email</th>
              <th className="py-3 px-6">Course Cohort</th>
              <th className="py-3 px-6">Term</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-gray-400">
                  No students found matching your filters.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const initials = student.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2);

                return (
                  <tr key={student.id ? `${student.id}-${idx}` : `student-${idx}`} className="hover:bg-gray-50/70 transition-colors">
                    {/* Name & Initials */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#e8f8f0] text-[#059669] flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {student.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-6 font-mono text-xs text-gray-600">
                      {student.email}
                    </td>

                    {/* Course */}
                    <td className="py-3.5 px-6">
                      <div>
                        <span className="text-xs font-semibold text-gray-800">
                          {student.courseName}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 block">
                          {student.courseCode}
                        </span>
                      </div>
                    </td>

                    {/* Term */}
                    <td className="py-3.5 px-6 text-xs text-gray-500 font-mono">
                      {student.term}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] bg-[#e8f8f0] px-2.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3ECE92]" />
                        <span>Active</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="p-4 bg-[#fafbfb] border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-mono">
        <span>Showing {filteredStudents.length} of {students.length} students</span>
        <button
          onClick={onOpenImportModal}
          className="text-xs font-semibold text-[#059669] hover:underline"
        >
          + Add more students via CSV
        </button>
      </div>
    </div>
  );
};
