'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SessionItem,
  SessionAttendance,
  StudentAttendanceRecord,
  AttendanceStatus,
  StudentAttendanceStats,
} from '@/types';
import { mockRecentSessions } from '@/data/mockData';
import {
  enrolledCohortStudents,
  initialSessionAttendances,
  calculateAttendanceMetrics,
} from '@/data/attendanceMockData';

interface AttendanceContextType {
  sessions: SessionItem[];
  attendances: Record<string, SessionAttendance>;
  addSession: (sessionData: Omit<SessionItem, 'id'>) => SessionItem;
  updateSessionAttendance: (
    sessionId: string,
    records: Record<string, StudentAttendanceRecord>
  ) => void;
  markAllSessionStatus: (sessionId: string, status: AttendanceStatus) => void;
  getStudentAttendance: (studentEmail: string) => StudentAttendanceStats;
  getSessionAttendance: (sessionId: string) => SessionAttendance;
  overallInstitutionAttendance: number;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const SESSIONS_STORAGE_KEY = 'aivalytics_sessions_v1';
const ATTENDANCE_STORAGE_KEY = 'aivalytics_attendance_v1';

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessions, setSessions] = useState<SessionItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (savedSessions) {
          return JSON.parse(savedSessions);
        }
      } catch (err) {
        console.error('Failed to load sessions from localStorage', err);
      }
    }
    return mockRecentSessions;
  });

  const [attendances, setAttendances] = useState<Record<string, SessionAttendance>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAttendance = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
        if (savedAttendance) {
          return JSON.parse(savedAttendance);
        }
      } catch (err) {
        console.error('Failed to load attendance from localStorage', err);
      }
    }
    return initialSessionAttendances;
  });

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
        localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendances));
      } catch (err) {
        console.error('Failed to save attendance to localStorage', err);
      }
    }
  }, [sessions, attendances]);

  // Add new session scheduled by Admin
  const addSession = (sessionData: Omit<SessionItem, 'id'>): SessionItem => {
    const newId = `sess_${Date.now()}`;
    const newSession: SessionItem = {
      ...sessionData,
      id: newId,
    };

    // Initialize attendance record for this new session with enrolled cohort
    const initialRecords: Record<string, StudentAttendanceRecord> = {};
    enrolledCohortStudents.forEach((student) => {
      initialRecords[student.studentEmail] = {
        studentId: student.studentId,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        status: 'PRESENT', // default to present for newly created sessions
        markedAt: 'Just now',
      };
    });

    const metrics = calculateAttendanceMetrics(initialRecords);

    const newAttendance: SessionAttendance = {
      sessionId: newId,
      sessionTitle: newSession.title,
      course: newSession.course,
      date: newSession.date || 'Today',
      time: newSession.time || '10:00 AM',
      lastUpdated: 'Just now',
      ...metrics,
      records: initialRecords,
    };

    setSessions((prev) => [newSession, ...prev]);
    setAttendances((prev) => ({
      ...prev,
      [newId]: newAttendance,
    }));

    return newSession;
  };

  // Update attendance for a specific session
  const updateSessionAttendance = (
    sessionId: string,
    records: Record<string, StudentAttendanceRecord>
  ) => {
    const session = sessions.find((s) => s.id === sessionId);
    const metrics = calculateAttendanceMetrics(records);

    const updated: SessionAttendance = {
      sessionId,
      sessionTitle: session?.title || 'Course Lecture Session',
      course: session?.course || 'General',
      date: session?.date || 'Today',
      time: session?.time || '10:00 AM',
      lastUpdated: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      ...metrics,
      records,
    };

    setAttendances((prev) => ({
      ...prev,
      [sessionId]: updated,
    }));
  };

  // Mark all students in session with a specific status
  const markAllSessionStatus = (sessionId: string, status: AttendanceStatus) => {
    const currentAttendance = getSessionAttendance(sessionId);
    const updatedRecords: Record<string, StudentAttendanceRecord> = {};

    Object.entries(currentAttendance.records).forEach(([email, rec]) => {
      updatedRecords[email] = {
        ...rec,
        status,
        markedAt: 'Just now',
      };
    });

    updateSessionAttendance(sessionId, updatedRecords);
  };

  // Get or initialize attendance for a session
  const getSessionAttendance = (sessionId: string): SessionAttendance => {
    if (attendances[sessionId]) {
      return attendances[sessionId];
    }

    const session = sessions.find((s) => s.id === sessionId);
    const initialRecords: Record<string, StudentAttendanceRecord> = {};
    enrolledCohortStudents.forEach((student) => {
      initialRecords[student.studentEmail] = {
        studentId: student.studentId,
        studentName: student.studentName,
        studentEmail: student.studentEmail,
        status: 'PRESENT',
      };
    });

    const metrics = calculateAttendanceMetrics(initialRecords);

    return {
      sessionId,
      sessionTitle: session?.title || 'Course Lecture Session',
      course: session?.course || 'General',
      date: session?.date || 'Scheduled',
      time: session?.time || '10:00 AM',
      ...metrics,
      records: initialRecords,
    };
  };

  // Get student attendance metrics for the student dashboard
  const getStudentAttendance = (studentEmail: string): StudentAttendanceStats => {
    const emailNorm = studentEmail.toLowerCase();
    const sessionDetails: Array<{
      sessionId: string;
      sessionTitle: string;
      date: string;
      status: AttendanceStatus;
    }> = [];

    let attendedCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    // Iterate through all sessions that have attendance records
    sessions.forEach((s) => {
      const att = attendances[s.id];
      if (att && att.records[emailNorm]) {
        const rec = att.records[emailNorm];
        if (rec.status === 'PRESENT') {
          attendedCount++;
        } else if (rec.status === 'LATE') {
          attendedCount++;
          lateCount++;
        } else {
          absentCount++;
        }

        sessionDetails.push({
          sessionId: s.id,
          sessionTitle: s.title,
          date: s.date || 'Recent',
          status: rec.status,
        });
      }
    });

    const totalSessions = sessionDetails.length;
    const percentage = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;

    return {
      studentEmail,
      totalSessions,
      attendedSessions: attendedCount,
      missedSessions: absentCount,
      lateSessions: lateCount,
      percentage,
      sessionDetails,
    };
  };

  // Calculate overall institution attendance rate across all marked sessions
  const markedSessions = Object.values(attendances);
  const overallInstitutionAttendance =
    markedSessions.length > 0
      ? Math.round(
          markedSessions.reduce((acc, curr) => acc + curr.attendanceRate, 0) /
            markedSessions.length
        )
      : 84;

  return (
    <AttendanceContext.Provider
      value={{
        sessions,
        attendances,
        addSession,
        updateSessionAttendance,
        markAllSessionStatus,
        getStudentAttendance,
        getSessionAttendance,
        overallInstitutionAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
