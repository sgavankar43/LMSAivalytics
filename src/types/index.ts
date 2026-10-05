export type UserRole = 'learner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: UserRole;
  term?: string;
  headline?: string;
  phone?: string;
  location?: string;
  cohort?: string;
  bio?: string;
  studentId?: string;
  department?: string;
  joinedDate?: string;
  gpa?: string;
}

export interface MetricCardData {
  id: string;
  title: string;
  value: number | string;
  changeText: string;
  changeType: 'positive' | 'neutral' | 'negative' | 'alert';
  icon: 'book' | 'check-circle' | 'video' | 'ticket' | 'users' | 'trending-up' | 'alert-circle';
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
  durationMinutes?: number;
  startTime?: string | number;
  expiresAt?: string | number;
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
  enrolledStudentsCount?: number;
}

export type TicketStatus = 'Open' | 'Under Review' | 'Completed' | 'Rejected' | 'In Progress' | 'Resolved';
export type TicketCategory = 'Academic' | 'Technical' | 'Evaluation' | 'General';
export type TicketPriority = 'Low' | 'Medium' | 'High';
export type StudentFeedbackRating = 'Satisfied' | 'Not Satisfied';

export interface SupportTicket {
  id: string;
  ticketId: string;
  ticketCode?: string;
  subject: string;
  course: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastUpdated: string;
  repliesCount: number;
  description: string;
  studentName?: string;
  studentEmail?: string;
  userId?: string;
  adminRemarks?: string | null;
  adminRespondedAt?: string | null;
  adminRespondedBy?: string | null;
  studentFeedback?: StudentFeedbackRating | null;
  studentFeedbackNote?: string | null;
  studentFeedbackAt?: string | null;
}

export interface CertificateItem {
  id: string;
  title: string;
  issueDate: string;
  credentialId: string;
  status: 'Issued' | 'Pending';
  grade: string;
  skills?: string[];
  description?: string;
  issuer?: string;
  program?: string;
}

// Admin Specific Data Contracts
export interface AdminTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Grading' | 'Curriculum' | 'Support' | 'Faculty';
  dueDate: string;
  createdAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  targetType: 'all' | 'course' | 'individual';
  targetValue?: string;
  sentAt: string;
  totalTargetCount: number;
  readCount: number;
}

export interface ImportedStudent {
  id: string;
  fullName: string;
  email: string;
  courseCode: string;
  courseName: string;
  term: string;
  enrolledAt: string;
  status: 'Active' | 'Pending';
}

// Test & Quiz Data Contracts
export interface QuizQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseCode: string;
  courseName: string;
  timeLimitMinutes: number;
  passingPercentage: number;
  totalPoints: number;
  questions: QuizQuestion[];
  createdAt: string;
  status: 'Published' | 'Draft' | 'Archived';
  totalAttempts: number;
  avgScore: number;
  passRate: number;
}

export interface StudentQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  courseCode: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number; // in percentage e.g. 85
  pointsScored: number;
  totalPoints: number;
  passed: boolean;
  answers: Record<string, string>; // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  timeSpentSeconds: number;
  completedAt: string;
}

export interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  avgScore: number;
  passRate: number;
}

// Guided Project Submissions Data Contracts
export type SubmissionFileType = 'pdf' | 'doc' | 'ppt' | 'image' | 'link';

export interface SubmittedFile {
  name: string;
  size: string;
  type: SubmissionFileType;
  url?: string;
}

export interface ProjectSubpart {
  id: string;
  moduleId: string;
  subpartCode: string;
  title: string;
  description: string;
  deadline: string;
  allowedFormats: SubmissionFileType[];
  maxPoints: number;
  guidelines: string[];
}

export interface ProjectModule {
  id: string;
  moduleNumber: number;
  title: string;
  subtitle: string;
  weeks: string;
  miniChallenge: string;
  deliverableBuild: string;
  certificationName: string;
  subparts: ProjectSubpart[];
  status: 'active' | 'upcoming' | 'completed';
}

export type SubmissionReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REVISION_REQUESTED'
  | 'EXCELLENT';

export interface StudentProjectSubmission {
  id: string;
  moduleId: string;
  subpartId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  files: SubmittedFile[];
  links: string[];
  studentNotes?: string;
  status: SubmissionReviewStatus;
  score?: number;
  maxPoints: number;
  adminRemarks?: string;
  adminEvaluatedAt?: string;
  adminEvaluatorName?: string;
}

export interface ProjectSubmissionStats {
  totalSubparts: number;
  totalSubmissions: number;
  pendingReview: number;
  approvedCount: number;
  revisionRequestedCount: number;
}

// Attendance Types
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: AttendanceStatus;
  markedAt?: string;
  notes?: string;
}

export interface SessionAttendance {
  sessionId: string;
  sessionTitle: string;
  course: string;
  date: string;
  time: string;
  records: Record<string, StudentAttendanceRecord>; // studentEmail -> record
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number; // percentage (0 - 100)
  lastUpdated?: string;
}

export interface StudentAttendanceStats {
  studentEmail: string;
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  lateSessions: number;
  percentage: number;
  sessionDetails: Array<{
    sessionId: string;
    sessionTitle: string;
    date: string;
    status: AttendanceStatus;
  }>;
}
