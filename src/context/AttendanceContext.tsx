'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  SessionItem,
  SessionStatus,
  SessionType,
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
import { useNotifications } from '@/context/NotificationContext';
import { supabase } from '@/lib/supabase/client';
import { parseDbTimestamp } from '@/lib/dateUtils';

interface CreateLectureParams {
  title: string;
  course: string;
  meetingUrl?: string;
  durationMinutes?: number;
  instructor?: string;
  isLiveNow?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

interface AttendanceContextType {
  sessions: SessionItem[];
  activeLiveSession: SessionItem | null;
  attendances: Record<string, SessionAttendance>;
  addSession: (sessionData: Omit<SessionItem, 'id'>) => SessionItem;
  createLecture: (lectureData: CreateLectureParams) => Promise<SessionItem>;
  updateSessionAttendance: (
    sessionId: string,
    records: Record<string, StudentAttendanceRecord>
  ) => void;
  markAllSessionStatus: (sessionId: string, status: AttendanceStatus) => void;
  getStudentAttendance: (studentEmail: string) => StudentAttendanceStats;
  getSessionAttendance: (sessionId: string) => SessionAttendance;
  overallInstitutionAttendance: number;
  refreshSessions: () => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const SESSIONS_STORAGE_KEY = 'aivalytics_sessions_v2';
const ATTENDANCE_STORAGE_KEY = 'aivalytics_attendance_v2';

// Format helper
function formatTimeRange(start: Date, durationMinutes: number): string {
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const startStr = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endStr = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${startStr} - ${endStr}`;
}

// Convert DB ClassSession row to SessionItem
function mapDbToSession(row: any): SessionItem {
  const startTime = parseDbTimestamp(row.startTime);
  const durationMinutes = row.durationMinutes || 60;
  const expiresAt = row.expiresAt
    ? parseDbTimestamp(row.expiresAt)
    : startTime + durationMinutes * 60000;

  const now = Date.now();
  let status: SessionStatus = 'Closed';

  if (row.status === 'ENDED' || row.status === 'Closed' || row.status === 'CLOSED') {
    status = 'Closed';
  } else if (now < startTime - 60000) {
    status = 'Upcoming';
  } else if (now >= startTime - 60000 && now < expiresAt) {
    status = 'In Progress';
  } else {
    status = 'Closed';
  }

  const startDate = new Date(startTime);
  const dateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  const timeStr = formatTimeRange(startDate, durationMinutes);

  return {
    id: row.id,
    title: row.title,
    course: row.course || 'AI-Native Project Management',
    type: (row.type as SessionType) || 'LIVE',
    status,
    date: dateStr,
    time: timeStr,
    duration: `${durationMinutes} mins`,
    durationMinutes,
    startTime,
    expiresAt,
    instructor: row.instructor || 'Admin Faculty',
    recordingUrl: row.recordingUrl || undefined,
    meetingUrl: row.meetingUrl || 'https://meet.google.com/jye-igap-skb',
  };
}

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { sendNotification } = useNotifications();

  // 1. Initial State from localStorage (guarantees NO loss on page refresh)
  const [sessions, setSessions] = useState<SessionItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
        if (savedSessions) {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Sanitize legacy sess_3 or expired sessions from localStorage cache
            return parsed.map((s) => {
              if (s.id === 'sess_3' && s.status === 'In Progress') {
                return { ...s, status: 'Closed' as SessionStatus };
              }
              return s;
            });
          }
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

  // 2. Fetch from Supabase Postgres
  const fetchSessionsFromDb = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ClassSession')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.warn('Supabase ClassSession fetch notice:', error.message);
        return;
      }

      if (data && data.length > 0) {
        const dbSessions = data.map(mapDbToSession);
        setSessions((prev) => {
          // Merge DB sessions with existing sessions, avoiding duplicates
          const nonDb = prev.filter((local) => !dbSessions.some((db) => db.id === local.id));
          return [...dbSessions, ...nonDb];
        });
      }
    } catch (err) {
      console.error('Failed to load ClassSession from DB:', err);
    }
  }, []);

  // 3. Supabase Realtime Subscription
  useEffect(() => {
    fetchSessionsFromDb();

    const channel = supabase
      .channel('realtime:class_sessions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ClassSession' },
        (payload) => {
          const inserted = mapDbToSession(payload.new);
          setSessions((prev) => {
            if (prev.some((s) => s.id === inserted.id)) return prev;
            return [inserted, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ClassSession' },
        (payload) => {
          const updated = mapDbToSession(payload.new);
          setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSessionsFromDb]);

  // 4. Dynamic Expiration & Status Transition Engine
  // Checks every 5 seconds if any session duration has expired
  useEffect(() => {
    const checkExpirations = () => {
      const now = Date.now();
      let hasChanges = false;

      setSessions((prev) => {
        const updated = prev.map((session) => {
          if (!session.expiresAt) return session;

          const expTime = parseDbTimestamp(session.expiresAt);
          const startTimeNum = session.startTime ? parseDbTimestamp(session.startTime) : null;

          // Transition to Closed if expired
          if (now >= expTime && session.status === 'In Progress') {
            hasChanges = true;
            return {
              ...session,
              status: 'Closed' as SessionStatus,
            };
          }

          // Transition to In Progress if start time reached
          if (
            startTimeNum !== null &&
            now >= startTimeNum - 60000 &&
            now < expTime &&
            session.status === 'Upcoming'
          ) {
            hasChanges = true;
            return {
              ...session,
              status: 'In Progress' as SessionStatus,
            };
          }

          return session;
        });

        return hasChanges ? updated : prev;
      });
    };

    const interval = setInterval(checkExpirations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Helper to initialize attendance record for a session
  const initAttendanceForSession = useCallback(
    (sessionId: string, sessionTitle: string, course: string, date: string, time: string) => {
      const initialRecords: Record<string, StudentAttendanceRecord> = {};
      enrolledCohortStudents.forEach((student) => {
        initialRecords[student.studentEmail] = {
          studentId: student.studentId,
          studentName: student.studentName,
          studentEmail: student.studentEmail,
          status: 'PRESENT',
          markedAt: 'Just now',
        };
      });

      const metrics = calculateAttendanceMetrics(initialRecords);

      const newAttendance: SessionAttendance = {
        sessionId,
        sessionTitle,
        course,
        date,
        time,
        lastUpdated: 'Just now',
        ...metrics,
        records: initialRecords,
      };

      setAttendances((prev) => ({
        ...prev,
        [sessionId]: newAttendance,
      }));
    },
    []
  );

  // 5. Create Lecture (Admin Pipeline with Meet Link, Broadcast Notification & Expiration)
  const createLecture = useCallback(
    async (params: CreateLectureParams): Promise<SessionItem> => {
      const durationMin = params.durationMinutes || 60;
      const isLive = params.isLiveNow !== false; // defaults to live now
      const startTime = isLive
        ? Date.now()
        : params.scheduledDate
        ? new Date(params.scheduledDate).getTime()
        : Date.now();
      const expiresAt = startTime + durationMin * 60000;
      const meetingUrl = params.meetingUrl?.trim() || 'https://meet.google.com/jye-igap-skb';
      const instructor = params.instructor || 'Prof. Marcus Vance';
      const startDate = new Date(startTime);
      const dateStr = isLive
        ? 'Today'
        : startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const timeStr = formatTimeRange(startDate, durationMin);

      const tempId = `sess_live_${Date.now()}`;
      const newSession: SessionItem = {
        id: tempId,
        title: params.title.trim(),
        course: params.course,
        type: 'LIVE',
        status: isLive ? 'In Progress' : 'Upcoming',
        date: dateStr,
        time: timeStr,
        duration: `${durationMin} mins`,
        durationMinutes: durationMin,
        startTime,
        expiresAt,
        instructor,
        meetingUrl,
      };

      // 1. Add optimistically to local sessions state
      setSessions((prev) => [newSession, ...prev]);

      // 2. Initialize attendance records
      initAttendanceForSession(tempId, newSession.title, newSession.course, dateStr, timeStr);

      // 3. Broadcast real-time notification to all students
      sendNotification({
        title: isLive ? `🔴 Live Lecture Started: ${newSession.title}` : `📅 New Lecture Scheduled: ${newSession.title}`,
        message: `${instructor} has ${
          isLive ? 'started an interactive live classroom' : 'scheduled a lecture'
        } for ${newSession.course}. Duration: ${durationMin} mins. Click 'Join Live' to enter the Google Meet session.`,
        priority: isLive ? 'Urgent' : 'Important',
        type: 'session',
        targetType: 'all',
        actionUrl: meetingUrl,
      });

      // 4. Persist to Supabase Postgres ClassSession table
      try {
        const { data: dbRow, error } = await supabase
          .from('ClassSession')
          .insert([
            {
              title: newSession.title,
              course: newSession.course,
              instructor,
              meetingUrl,
              type: 'LIVE',
              status: isLive ? 'In Progress' : 'Upcoming',
              durationMinutes: durationMin,
              startTime: new Date(startTime).toISOString(),
              expiresAt: new Date(expiresAt).toISOString(),
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase ClassSession insert error:', error.message);
        } else if (dbRow) {
          const persistedSession = mapDbToSession(dbRow);
          setSessions((prev) =>
            prev.map((s) => (s.id === tempId ? persistedSession : s))
          );
          initAttendanceForSession(persistedSession.id, persistedSession.title, persistedSession.course, dateStr, timeStr);
          return persistedSession;
        }
      } catch (err) {
        console.error('Failed to persist lecture to PostgreSQL:', err);
      }

      return newSession;
    },
    [sendNotification, initAttendanceForSession]
  );

  // Backward-compatible addSession
  const addSession = useCallback(
    (sessionData: Omit<SessionItem, 'id'>): SessionItem => {
      const newId = `sess_${Date.now()}`;
      const durationMin = sessionData.durationMinutes || 60;
      const startTime = Date.now();
      const expiresAt = startTime + durationMin * 60000;

      const newSession: SessionItem = {
        ...sessionData,
        id: newId,
        meetingUrl: sessionData.meetingUrl || 'https://meet.google.com/jye-igap-skb',
        durationMinutes: durationMin,
        startTime,
        expiresAt,
      };

      initAttendanceForSession(
        newId,
        newSession.title,
        newSession.course,
        newSession.date || 'Today',
        newSession.time || '10:00 AM'
      );

      setSessions((prev) => [newSession, ...prev]);

      // Broadcast notification
      sendNotification({
        title: `🔴 Live Lecture: ${newSession.title}`,
        message: `${newSession.instructor || 'Faculty'} scheduled lecture for ${newSession.course}. Meet link: ${newSession.meetingUrl}`,
        priority: newSession.status === 'In Progress' ? 'Urgent' : 'Important',
        type: 'session',
        targetType: 'all',
        actionUrl: newSession.meetingUrl,
      });

      return newSession;
    },
    [initAttendanceForSession, sendNotification]
  );

  // Update attendance for a specific session
  const updateSessionAttendance = useCallback(
    (sessionId: string, records: Record<string, StudentAttendanceRecord>) => {
      const session = sessions.find((s) => s.id === sessionId);
      const metrics = calculateAttendanceMetrics(records);

      const updated: SessionAttendance = {
        sessionId,
        sessionTitle: session?.title || 'Course Lecture Session',
        course: session?.course || 'General',
        date: session?.date || 'Today',
        time: session?.time || '10:00 AM',
        lastUpdated:
          new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }) +
          ' • ' +
          new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        ...metrics,
        records,
      };

      setAttendances((prev) => ({
        ...prev,
        [sessionId]: updated,
      }));
    },
    [sessions]
  );

  // Mark all students in session with a specific status
  const markAllSessionStatus = useCallback(
    (sessionId: string, status: AttendanceStatus) => {
      const currentAttendance = attendances[sessionId];
      if (!currentAttendance) return;

      const updatedRecords: Record<string, StudentAttendanceRecord> = {};
      Object.entries(currentAttendance.records).forEach(([email, rec]) => {
        updatedRecords[email] = {
          ...rec,
          status,
          markedAt: 'Just now',
        };
      });

      updateSessionAttendance(sessionId, updatedRecords);
    },
    [attendances, updateSessionAttendance]
  );

  // Get or initialize attendance for a session
  const getSessionAttendance = useCallback(
    (sessionId: string): SessionAttendance => {
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
    },
    [attendances, sessions]
  );

  // Get student attendance metrics for the student dashboard
  const getStudentAttendance = useCallback(
    (studentEmail: string): StudentAttendanceStats => {
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
    },
    [sessions, attendances]
  );

  // Current active live session (prioritize the most recently launched active lecture)
  const activeLiveSession = useMemo(() => {
    const liveSessions = sessions.filter((s) => s.status === 'In Progress');
    if (liveSessions.length === 0) return null;
    return liveSessions.slice().sort((a, b) => {
      const timeA = parseDbTimestamp(a.startTime);
      const timeB = parseDbTimestamp(b.startTime);
      return timeB - timeA;
    })[0];
  }, [sessions]);

  // Overall institution attendance
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
        activeLiveSession,
        attendances,
        addSession,
        createLecture,
        updateSessionAttendance,
        markAllSessionStatus,
        getStudentAttendance,
        getSessionAttendance,
        overallInstitutionAttendance,
        refreshSessions: fetchSessionsFromDb,
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
