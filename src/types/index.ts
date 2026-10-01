export type UserRole = 'learner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: UserRole;
  term?: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: number | string;
  changeText: string;
  changeType: 'positive' | 'neutral' | 'negative' | 'alert';
  icon: 'book' | 'check-circle' | 'video' | 'ticket';
}

export type SessionType = 'RECORDING' | 'LIVE';
export type SessionStatus = 'Closed' | 'In Progress' | 'Upcoming';

export interface SessionItem {
  id: string;
  title: string;
  course: string;
  type: SessionType;
  status: SessionStatus;
  date?: string;
  time?: string;
  duration?: string;
  instructor?: string;
  recordingUrl?: string;
  meetingUrl?: string;
}

export interface MonthlyAttendance {
  month: string;
  shortMonth: string;
  count: number;
}

export interface WeeklyActivity {
  week: string;
  hours: number;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  category: string;
  instructor: string;
  instructorRole: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  totalLessons: number;
  completedLessons: number;
  totalHours: string;
  description: string;
  thumbnail?: string;
  nextLesson?: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  subject: string;
  course: string;
  category: 'Academic' | 'Technical' | 'Evaluation' | 'General';
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  lastUpdated: string;
  repliesCount: number;
  description: string;
}

export interface CertificateItem {
  id: string;
  title: string;
  issueDate: string;
  credentialId: string;
  status: 'Issued' | 'Pending';
  grade: string;
}
