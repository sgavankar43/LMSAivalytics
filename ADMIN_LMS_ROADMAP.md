# AIvalytics LMS - Admin System Task Roadmap & Specification

This document tracks all features, data structures, and implementation phases for the Admin Dashboard and Management Portal.

---

## 📋 Feature Breakdown & Scope

### 1. Home Screen Role-Based Routing
- [x] Detect `user.role === 'admin'` from AuthContext.
- [x] If `admin`: Render the comprehensive **Admin Dashboard** on `/`.
- [x] If `learner`: Render the Learner Dashboard.
- [x] Role-adaptive Sidebar: Provide admin-specific navigation links with badges.

---

### 2. Statistical Data & Institution KPIs
- [x] **Total Active Students**: Track total registered & imported learners.
- [x] **Courses & Active Cohorts**: Total courses, active syllabi, and curriculum modules.
- [x] **Institution-wide Live Attendance**: Average attendance rate across all live lectures.
- [x] **Open Support Tickets**: Pending student tickets requiring faculty action.
- [x] **Monthly Student Engagement Analytics**: Visual monthly bar/area comparison of attendance and quiz submissions.
- [x] **Curriculum Completion Average**: Overall student progress indicator.

---

### 3. Upcoming Events Card
- [x] Display upcoming live lectures, grading deadlines, and faculty reviews.
- [x] Status tags: `Live Now` (animated indicator), `Upcoming Today`, `Scheduled`.
- [x] Manual "Schedule Event" action with modal:
  - Event title, course, date, time, duration, instructor, and meeting link.
- [x] Direct "Launch Live Room" action.

---

### 4. Task Management Card
- [x] Faculty & Coordinator Task Tracker.
- [x] Manual Task Creation:
  - Title, due date, category (Grading, Curriculum, Support, Faculty), priority (`High`, `Medium`, `Low`).
- [x] Task Completion: Toggle checkmark with strikethrough styling and timestamp.
- [x] Task Deletion: Remove task with instant reactivity.
- [x] Status Filtering: `All`, `Pending`, `Completed`.

---

### 5. Notification & Broadcast Center
- [x] Announcement composer: Title, message body, priority (`Normal`, `Important`, `Urgent`).
- [x] Targeting & Filtration function:
  - Filter by: `All Students`, `By Specific Course` (e.g. ACA-101, BRM-204, AML-305), or `Individual Email`.
- [x] Real-time injection into the system notification bell for targeted users.
- [x] Sent Broadcasts History Log with delivery recipient counts.

---

### 6. CSV Bulk User Import
- [x] CSV Drag & Drop / File Upload interface.
- [x] "Download Sample CSV" template generator (`fullName,email,courseCode,term`).
- [x] In-browser CSV parsing with validation:
  - Validates email syntax.
  - Checks for duplicate emails.
  - Verifies course code mapping.
- [x] Table preview of parsed students before confirming import.
- [x] Import execution: creates user records with student enrollment.
- [x] Student Directory table with search, course filtering, and remove student action.

---

### 7. Course & Cohort Overview
- [x] Course cards showing enrolled student counts, assigned instructor, and progress index.
- [x] Quick support ticket resolver directly from the admin dashboard.

---

### 8. Assessment & Quiz Engine (Timed Tests & Result Analytics)
- [x] **Student Timed Test Experience (`/tests`)**:
  - Pre-test briefing modal with question count, pass criteria (%), and integrity rules.
  - Active countdown timer with real-time seconds ticking and warning state under 2 mins.
  - Interactive radio option selection (A, B, C, D) with instantaneous selection feedback.
  - Question-by-question navigation with previous/next controls, review flagging, and question palette.
  - Auto-submission on timer expiry (00:00) and manual submission confirmation check.
  - Comprehensive results & answer review screen displaying percentage score, pass/fail badge, selected choice, correct answers highlighted in green, and pedagogical explanations.
- [x] **Admin Test Creation via CSV Upload**:
  - Drag-and-drop / file upload for CSV question banks.
  - Downloadable sample CSV template (`questionNumber,questionText,optionA,optionB,optionC,optionD,correctOption,explanation`).
  - Test metadata configurator: title, course cohort selector, duration time limit in minutes, and passing percentage threshold.
  - In-browser question parser and preview matrix before publishing.
- [x] **Admin Test Result Stats on Dashboard**:
  - Top metric badges: Total published quizzes, total attempts, cohort pass rate %, and average score %.
  - Quizzes performance breakdown table (Attempts, average score progress bar, pass rate).
  - Student submissions audit log (Student name, email, score, pass/fail status, timestamp).
  - Drilldown modal to inspect individual student submissions and scores per test.

---

### 9. Live Session Attendance Management System
- [x] **Data Model & State Management (`AttendanceContext`)**:
  - `SessionItem` tracking: ID, title, course, type, status, date, time, instructor, meeting/recording URL.
  - `StudentAttendanceStatus`: `studentId`, `studentName`, `studentEmail`, `status: 'PRESENT' | 'ABSENT' | 'LATE'`, `markedAt`.
  - `SessionAttendance`: `sessionId`, `sessionTitle`, `date`, `time`, `markedAt`, `records` dictionary.
  - Reactive `localStorage` persistence and cross-session analytics.
  - Seed attendance data for existing sessions (`sess_1` to `sess_6`) across enrolled learners (`Alex Morgan`, `Sarah Connor`, `David Miller`, `Emily Watson`, `Sophia Patel`, `Liam Chen`).
- [x] **Admin Attendance Console**:
  - Integrate into `AdminUpcomingEventsCard` on Admin Dashboard:
    - Display attendance pill for each session (e.g., `5/6 Present (83%)` or `Mark Attendance`).
    - Dedicated "Mark Attendance" / "Update Attendance" button on each session card.
  - Attendance Roster Modal (`AdminAttendanceModal.tsx`):
    - Session metadata header (Title, Date, Time, Course).
    - Summary stat chips: Total Enrolled, Present count, Absent count, Attendance %.
    - Quick actions: "Mark All Present" and "Mark All Absent".
    - Interactive student roster: Toggle Present / Absent / Late for each student with color-coded feedback.
    - Save Attendance action with instant notification feedback.
  - Dynamic roster generation when Admin schedules a new session from the modal:
    - Creates empty or pre-populated roster for the new session immediately.
    - Allows marking attendance immediately or anytime during/after the live lecture.
- [x] **Student Dashboard Attendance Card**:
  - Rendered on the Student Home Dashboard (`/`).
  - Directly reflects student's real calculated attendance percentage (e.g. `83%`, `5 of 6 live sessions attended`).
  - No extraneous options or features on the student side (clean, read-only display).
- [x] **Quality Assurance & Verification**:
  - Verify attendance updates in real time when Admin marks Alex Morgan present or absent.
  - Verify new scheduled sessions allow attendance marking and update student metrics accordingly.
  - Run `npm run build` to confirm zero TypeScript errors (verified with Turbopack).

---

### 10. User Profile & Credential Management Scope
- [x] **Learner Profile (`/profile`)**:
  - Student identity hero (Name, student ID, bio, contact details, cohort).
  - Academic KPIs: Cumulative GPA, live attendance %, active syllabi, earned certifications.
  - "My Courses" section with progress tracking and direct resume link.
  - "Program Certifications" section with official verified certificates and interactive modal.
  - Real-time "Edit Profile" modal.
- [x] **Admin Exclusion**:
  - Profile link removed from Admin sidebar navigation items.
  - Admin sidebar footer displays static role presentation card (not linked to `/profile`).
  - Header profile dropdown hides profile link for admin role.
  - Direct navigation to `/profile` by an admin automatically redirects back to `/` (Admin Dashboard).


