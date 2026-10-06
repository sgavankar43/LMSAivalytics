'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ImportedStudent } from '@/types';
import { initialImportedStudents } from '@/data/adminMockData';

interface EnrollmentContextType {
  students: ImportedStudent[];
  totalEnrolled: number;
  activeCount: number;
  pendingCount: number;
  importStudents: (newStudents: ImportedStudent[]) => void;
  deleteStudent: (id: string) => void;
  toggleStudentStatus: (id: string) => void;
  exportStudentsToCsv: () => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(undefined);

const ENROLLMENT_STORAGE_KEY = 'aivalytics_enrollment_v1';

export const EnrollmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<ImportedStudent[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ENROLLMENT_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.error('Failed to load enrolled students from localStorage', err);
      }
    }
    return initialImportedStudents;
  });

  // Sync with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(students));
      } catch (err) {
        console.error('Failed to persist enrolled students to localStorage', err);
      }
    }
  }, [students]);

  const importStudents = (newStudents: ImportedStudent[]) => {
    setStudents((prev) => {
      let maxNum = 0;
      prev.forEach((s) => {
        const match = s.id.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });

      const existingIds = new Set(prev.map((s) => s.id.toUpperCase()));

      const processed = newStudents.map((s) => {
        let candidateId = s.id ? s.id.trim().toUpperCase() : '';

        if (!candidateId || existingIds.has(candidateId)) {
          maxNum++;
          candidateId = `STD_${maxNum}`;
        }

        existingIds.add(candidateId);
        return { ...s, id: candidateId };
      });

      return [...processed, ...prev];
    });
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleStudentStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Active' ? 'Pending' : 'Active';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const exportStudentsToCsv = () => {
    if (typeof window === 'undefined') return;

    const headers = ['Student ID', 'Full Name', 'Email', 'Course Code', 'Course Name', 'Term', 'Status', 'Enrolled Date'];
    const rows = students.map((s) => [
      `"${s.id}"`,
      `"${s.fullName}"`,
      `"${s.email}"`,
      `"${s.courseCode}"`,
      `"${s.courseName}"`,
      `"${s.term}"`,
      `"${s.status}"`,
      `"${s.enrolledAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `aivalytics_student_enrollment_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Base batch of 143 existing institution records plus dynamic directory
  const totalEnrolled = 143 + students.length;
  const activeCount = students.filter((s) => s.status === 'Active').length;
  const pendingCount = students.filter((s) => s.status === 'Pending').length;

  return (
    <EnrollmentContext.Provider
      value={{
        students,
        totalEnrolled,
        activeCount,
        pendingCount,
        importStudents,
        deleteStudent,
        toggleStudentStatus,
        exportStudentsToCsv,
      }}
    >
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error('useEnrollment must be used within an EnrollmentProvider');
  }
  return context;
};
