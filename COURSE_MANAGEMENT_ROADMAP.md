# AIvalytics LMS - Flagship Course Architecture & Admin Curriculum Engine Roadmap

## 🎯 Executive Product Vision
AIvalytics is launching its production-ready flagship product: **AI-Native Project Management Program** (3-Month Executive Program, 3 Professional Certifications).

This roadmap establishes the complete architecture, data models, admin management tools, and learner experience for:
1. Purging all legacy sample courses (`ACA-101`, `BRM-204`, `AML-305`) from the database and codebase.
2. Establishing **AI-Native Project Management** (`AINPM-101`) as the primary flagship course with 3 foundational modules and 18 sub-modules/lessons derived from the official curriculum specification.
3. Providing a robust, user-friendly **Admin Course & Curriculum Builder** that allows administrators to:
   - Create and manage course modules.
   - Create and manage sub-modules (lessons/curriculum units) beneath each module, identical in design and UX to the Assessment Hub (`/assessments`).
4. Delivering a production-ready, highly optimized, responsive **Learner Classroom** with video playback, lesson completion tracking, and real-time progress calculation.

---

## 🏛️ System Architecture & Entity Hierarchy

```
Course (AI-Native Project Management Program - AINPM-101)
│
├── Module 1: AI Foundations (Weeks 1–4)
│   ├── Sub-module 1.1: AI Fundamentals (LLMs, Tokens, Context Windows, Reasoning Models)
│   ├── Sub-module 1.2: Context Engineering (CTID, CO-STAR Frameworks, System Prompts)
│   ├── Sub-module 1.3: SOP Engineering (Machine-readable SOPs, Business Process Workflows)
│   ├── Sub-module 1.4: AI Builder Stack (Claude Code, Cursor, Lovable, v0, MCP Basics)
│   ├── Sub-module 1.5: Build: Production-Ready AI Agent (Agent Architecture & Execution)
│   └── Sub-module 1.6: Mini Challenge: Real-World Business AI Assistant Walkthrough
│
├── Module 2: AI Agents & Orchestration (Weeks 5–8)
│   ├── Sub-module 2.1: AI Workflow Automation (n8n Fundamentals, Webhooks, APIs)
│   ├── Sub-module 2.2: Knowledge & Memory Systems (RAG, Vector DBs, Context Retrieval)
│   ├── Sub-module 2.3: Multi-Agent Systems & Architecture (Manager, Specialist, Worker Agents)
│   ├── Sub-module 2.4: Business Automation Workflows (Sales, Marketing, Operations Pipelines)
│   ├── Sub-module 2.5: Build: Production-Ready Multi-Agent Workflow (End-to-end orchestration)
│   └── Sub-module 2.6: Mini Challenge: Multi-Agent Business System Walkthrough
│
└── Module 3: AI-Native Project Management (Weeks 9–12)
    ├── Sub-module 3.1: Narrow-First Playbook (Opportunity Assessment, Scoring Models)
    ├── Sub-module 3.2: Tiered Autonomy Framework (Observe → Advise → Recommend → Act)
    ├── Sub-module 3.3: AI Quality & Validation (Shadow Mode, LLM-as-a-Judge, Guardrails)
    ├── Sub-module 3.4: The PM as Execution Architect (WBS, RACI for AI Agents, Dashboards)
    ├── Sub-module 3.5: Build: AI-Powered Project System for GTM (End-to-End GTM Delivery)
    └── Sub-module 3.6: Mini Challenge: AI-Native Go-To-Market Execution Plan
```

---

## 📋 Phased Implementation Plan

### Phase 1: Database Migration & Seed Purge
- [x] Purge legacy sample courses (`ACA-101`, `BRM-204`, `AML-305`) and their orphaned child relations from Postgres via Prisma.
- [x] Seed the flagship **AI-Native Project Management** course (`AINPM-101`).
- [x] Seed the 3 curriculum modules (`AI Foundations`, `AI Agents & Orchestration`, `AI-Native Project Management`) in `CourseModule`.
- [x] Seed the 18 sub-modules / lessons with verified durations, topics, and descriptions in `Lesson`.
- [x] Update `Enrollment`, `Session`, and `Certificate` database records to link to the new course ID.

### Phase 2: TypeScript Data Contracts & Core State Management
- [x] Expand `src/types/index.ts` with comprehensive contracts:
  - `CourseSubmodule` / `Lesson`: id, moduleId, subpartCode, title, description, duration, videoUrl, resources, isCompleted.
  - `CurriculumModule`: id, courseId, moduleNumber, title, subtitle, weeks, certificationName, submodules array.
  - `CourseDetail`: full course metadata, instructor, modules list, progress stats.
- [x] Create `src/context/CourseContext.tsx`:
  - Client state with `localStorage` persistence and fallback seed data.
  - Admin Actions:
    - `adminAddModule(courseId, moduleData)`
    - `adminEditModule(moduleId, moduleData)`
    - `adminDeleteModule(moduleId)`
    - `adminAddSubmodule(moduleId, submoduleData)`
    - `adminEditSubmodule(submoduleId, submoduleData)`
    - `adminDeleteSubmodule(submoduleId)`
  - Learner Actions:
    - `toggleLessonComplete(courseId, lessonId)`
    - `getCourseProgress(courseId)`

### Phase 3: Admin Course & Module Builder Console
- [x] Update `/courses` for Admin role:
  - Program Overview hero with KPI chips (Total Modules, Sub-modules, Enrolled Learners, Completion Avg).
  - Tab Switcher: "Curriculum & Module Builder" vs "Learner View Preview".
  - **"+ Add Module" Modal** (Title, subtitle, week range, certification badge).
  - **"+ Add Sub-Module" Modal** (Parent module picker, title, code, description, duration, video URL, learning outcomes).
  - Module management controls: Delete module, add sub-module, reorder.
  - Sub-module management controls: Edit details, delete sub-module.
  - Visual styling strictly matching the high-reputation design of `ProjectSubmissionsAdminView` on `/assessments`.

### Phase 4: Learner Classroom & Interactive Player
- [x] Refactor `/courses` for Learners:
  - Display the flagship AI-Native Project Management course card with real progress metrics, active module indicator, and "Resume Course" action.
  - Curriculum syllabus drawer preview showing all 3 modules and 18 sub-modules with completion status.
- [x] Refactor `/courses/[id]` (The Interactive Classroom):
  - Dynamic loading from `CourseContext`.
  - Video player with responsive 16:9 container, custom controls, and active lesson title badge.
  - Sub-module switcher in sidebar with duration indicators and completion toggles.
  - Interactive tabs:
    - **Overview**: Core takeaways, frameworks (CTID, CO-STAR, n8n, Tiered Autonomy), quotes from brochure.
    - **Lecture Notes**: Machine-readable notes and architecture summaries.
    - **Downloads & Materials**: Templates, prompt libraries, and workflow JSON exports.
    - **Faculty Q&A**: Direct inquiry link to course instructors.

### Phase 5: Global Consistency & Cross-Component Integration
- [x] Clean legacy course codes across the entire application:
  - `GlobalSearchBar.tsx`: Update recommendations and search index to `AINPM-101`.
  - `BroadcastCenterModal.tsx`: Target courses dropdown updated to `AINPM-101`.
  - `CsvQuizUploadModal.tsx`: Link question banks to `AINPM-101`.
  - `CsvUserImportModal.tsx`: Update allowed course codes to `AINPM-101`.
  - `AdminUpcomingEventsCard.tsx` & `CreateLectureModal.tsx`: Link live lectures to `AI-Native Project Management`.
  - `profile/page.tsx` & `performance/page.tsx`: Update enrolled course badges and certificates to reflect the 3 program certifications.

### Phase 6: Production Verification & Zero Dead Code
- [x] Run `npm run build` with Turbopack to verify zero TypeScript errors.
- [x] Test end-to-end admin module creation, sub-module creation, and learner progress marking.
- [x] Ensure optimal performance and zero hydration warnings.
