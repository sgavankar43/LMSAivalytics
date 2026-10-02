# AIvalytics LMS - Guided Project Submissions & Assessment Engine Roadmap

## 🎯 Executive Overview & Scope
The AIvalytics platform is tailored for the flagship **AI-Native Project Management Program** (3-Month Executive Program, 3 Professional Certifications). This roadmap documents the Guided Project Submissions architecture where:
- Each project is a **Module** (Module 1: AI Foundations, Module 2: AI Agents & Orchestration, Module 3: AI-Native Project Management).
- Each Module contains **Subparts of Submissions** with specific deadlines, guidelines, rubrics, and accepted formats (**PDF, DOC, PPT, Images, Links**).
- **Learners** can view submission requirements, upload multi-format files and links, and receive feedback with Admin remarks.
- **Admins** can dynamically create modules, add subparts with deadlines, track student submissions, inspect deliverables, and provide remarks and evaluation grades.
- The **Assessments** navigation item in the Sidebar serves as the unified hub for Guided Project Submissions and Timed Milestone Assessments.

---

## 📋 Phased Implementation Plan

### Phase 1: Architecture & Type Definitions
- [x] Create `ASSESSMENT_SUBMISSIONS_ROADMAP.md` task tracker.
- [x] Define TypeScript contracts in `src/types/index.ts`:
  - `SubmissionFileType`: `'pdf' | 'doc' | 'ppt' | 'image' | 'link'`
  - `ProjectSubpart`: ID, Module ID, title, description, deadline, allowed formats, max points, rubric guidelines.
  - `ProjectModule`: ID, number (1, 2, 3), title, subtitle, weeks, mini-challenge, subparts array.
  - `SubmittedFile`: name, size, type, URL.
  - `StudentProjectSubmission`: ID, module ID, subpart ID, student details, submission files/links, student notes, status (`PENDING_REVIEW`, `APPROVED`, `REVISION_REQUESTED`, `EXCELLENT`), score, admin remarks, evaluated timestamp.
  - `SubmissionStats`: Total assigned, submitted count, pending review, approved.

---

### Phase 2: Seed Data & State Management
- [x] Create `src/data/projectSubmissionsData.ts`:
  - Module 1: **AI Foundations** (Weeks 1-4) - Mini Challenge: Build an AI Assistant that solves one real business problem.
    - Subpart 1.1: Context Engineering & Standard Operating Procedure (SOP) Blueprint (PDF/DOC)
    - Subpart 1.2: AI Assistant Video Walkthrough & System Architecture (Link/PPT)
    - Subpart 1.3: Production-Ready Agent Workspace & Prompt Library (Link/Doc)
  - Module 2: **AI Agents & Orchestration** (Weeks 5-8) - Mini Challenge: Build a multi-agent business system that automates an end-to-end business process.
    - Subpart 2.1: Multi-Agent Topology & n8n Workflow Blueprint (Image/PPT/PDF)
    - Subpart 2.2: Live Workflow Execution, Webhooks & Error Handling Demo (Link)
    - Subpart 2.3: Production RAG, Vector Embeddings & Agent Memory Audit (PDF/DOC)
  - Module 3: **AI-Native Project Management** (Weeks 9-12) - Mini Challenge: Design and execute an AI-native GTM project plan that automates key tasks and delivers real value.
    - Subpart 3.1: Work Breakdown Structure (WBS) & RACI Matrix for AI Agent Teams (PDF/PPT)
    - Subpart 3.2: AI-Driven GTM Project Execution Plan & Autonomous Safeguards (PDF/DOC)
    - Subpart 3.3: Final Project Presentation & Executive Dashboard (PPT/Link/PDF)
  - Realistic seed submissions for generic students (`alex.morgan@aivalytics.com`, `sarah.connor@aivalytics.com`, `david.miller@aivalytics.com`) with Admin remarks.
- [x] Create `src/context/ProjectSubmissionsContext.tsx`:
  - Client state persisted via `localStorage`.
  - Actions:
    - `submitProject(subpartId, files, links, notes)`
    - `adminAddModule(moduleData)`
    - `adminAddSubpart(moduleId, subpartData)`
    - `adminDeleteSubpart(subpartId)`
    - `adminUpdateDeadline(subpartId, newDeadline)`
    - `adminGiveRemark(submissionId, { remark, status, score })`
    - Helper queries: `getSubmissionsByStudent`, `getSubmissionsBySubpart`, `getModuleProgress`.

---

### Phase 3: Student Submission Components
- [x] `src/components/assessments/ProjectSubmissionsLearnerView.tsx`:
  - Overview banner: Program progress across Modules 1, 2, and 3.
  - Module accordion / cards showing subparts, status pills, and deadlines.
  - Subpart details modal/drawer:
    - Requirements, rubric guidelines, deadline countdown.
    - Drag-and-drop file uploader (supports `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.png`, `.jpg`, `.jpeg`).
    - External link input (Loom, GitHub, Google Drive, n8n live link).
    - Optional notes field for instructors.
    - Live file preview tags with remove button.
    - Submit deliverable action.
  - Admin Remarks Display:
    - Highlighted card showing Admin's feedback, evaluation status badge (`Approved`, `Needs Revision`, `Distinction`), score, and evaluated date.
    - Resubmission option if revision is requested.

---

### Phase 4: Admin Management & Review Components
- [x] `src/components/assessments/ProjectSubmissionsAdminView.tsx`:
  - Institutional submission stats: Total assigned, total submitted, pending review, approved.
  - Module & Subpart Manager:
    - "+ Add Project Module" modal.
    - "+ Add Submission Subpart" modal (title, instructions, deadline, allowed formats, max points).
    - Deadline editor.
  - Submissions Tracker & Review Desk:
    - Filter by Module, Subpart, or Student.
    - Submissions list showing who submitted, when, files, and links.
    - File viewer / link opener.
    - **Admin Remark Composer**:
      - Remark textarea with pedagogical feedback.
      - Status dropdown: `Approved`, `Needs Revision`, `Distinction`.
      - Score input (e.g. 95/100).
      - Submit remark button with instant reactive update.

---

### Phase 5: Navigation & Page Integration
- [x] Update `src/components/layout/Sidebar.tsx`:
  - Rename nav item to **Assessments** (`/assessments`, badge: `Projects & Tests`).
  - Active on `/assessments` and `/tests`.
- [x] Create `src/app/assessments/page.tsx`:
  - Segmented tab navigation:
    1. **Guided Projects & Submissions** (Modules 1, 2, 3 with subparts).
    2. **Milestone Quizzes** (The timed quiz engine).
  - Role-adaptive rendering: renders `<ProjectSubmissionsAdminView />` for Admin and `<ProjectSubmissionsLearnerView />` for Learner.
- [x] Update `/tests` to redirect or link seamlessly to `/assessments`.
- [x] Update Dashboard callout in `src/app/page.tsx` to point to `/assessments`.

---

### Phase 6: Quality Assurance & Verification
- [x] Run `npm run build` to verify zero TypeScript or Next.js build errors (Verified with Turbopack).
- [x] Verified full client state, module subparts, deadline tracking, multi-format file uploads (PDF, DOC, PPT, Images, Links), and Admin remark evaluation flow.
