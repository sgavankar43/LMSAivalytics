# AIvalytics LMS (Learning Management System)

A high-performance, responsive Learning Management System built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and architected for **Supabase (PostgreSQL, Auth, Edge Functions)** with deployment on **Vercel**.

---

## 🎨 Design Blueprint & Visual System

This project was built pixel-for-pixel according to the provided AIvalytics design blueprints:
- **Clean Aesthetic**: Crisp surfaces, soft borders (`#EAEDF0`), and light neutral canvas (`#F8FAF9`).
- **Signature Palette**: Emerald/Mint accents (`#3ECE92` / `#5AE4A8`), charcoal dark controls (`#121614`), and soft mint pill tags (`#E8F8F0`).
- **Typography & Layout**: Precise geometry, sans-serif typography, and dedicated SVG charts for monthly sessions and weekly learning trends.
- **Cross-Device Responsiveness**: Desktop sidebar, tablet 2-column flow, mobile slide-out drawer, and bottom thumb navigation.

---

## 🚀 Pages & Features Built

1. **Authentication (`/login`)**:
   - Matches the blueprint sign-in card with pill toggle (`Sign in` / `Sign up`).
   - Email & password inputs with custom icons and demo helper buttons.
   - Demo mode auto-signs in as **Alex Morgan (Learner)**, other generic learners, or **Admin Faculty**.
   - Seamlessly switches to Supabase Auth as soon as keys are placed in `.env.local`.

2. **Dashboard (`/` or `/dashboard`)**:
   - Greeting banner: *"Good to see you, Alex"* with month selector (*Aug 1 - Aug 31, 2026*).
   - **4 Metric Cards**: Courses enrolled (3), Sessions completed (7), Live sessions (3), Support tickets (2).
   - **Circular Gauges**: Course completion (24%), Live attendance (82%).
   - **Monthly Attendance Chart**: SVG bar chart with Jan-Dec bars and hover tooltips.
   - **Mini Stats**: Certificates issued (33%), Tickets resolved (0%).
   - **Weekly Learning Activity**: Smooth spline curve across W1-W8 with study hour data points.
   - **Recent Sessions Table**: Interactive session listings with `LIVE` / `RECORDING` badges, `In Progress` / `Closed` indicators, and modals for entering live classrooms or watching recordings.

3. **My Courses (`/courses` & `/courses/[id]`)**:
   - Enrolled course catalog with progress bars, module stats, and instructor profiles.
   - Course Classroom viewer with video player, syllabus modules, downloadable materials, and lecture notes.

4. **Support Desk (`/support`)**:
   - Ticket management matching the dashboard's 2 support tickets.
   - Filter by status (*Open, In Progress, Resolved*).
   - "Create New Ticket" modal and ticket reply threads.

5. **Performance & Credentials (`/performance`)**:
   - Grade & quiz breakdown across all enrolled courses.
   - Verified digital certificates hub with PDF download triggers.

6. **Live Sessions & Calendar (`/events`)**:
   - Real-time scheduled live seminars with active status indicators.
   - Quick "Join Live Classroom" integration and recording archive.

---

## 🛠️ Tech Stack & Directory Structure

```
LMS/
├── prisma/
│   └── schema.prisma         # PostgreSQL schema for Supabase (Users, Courses, Modules, Tickets, etc.)
├── src/
│   ├── app/
│   │   ├── courses/          # Course catalog & classroom [id] viewer
│   │   ├── events/           # Live sessions & calendar
│   │   ├── login/            # Sign in / Sign up page matching blueprint
│   │   ├── performance/      # Performance analytics & certificates
│   │   ├── support/          # Support desk & ticket management
│   │   ├── layout.tsx        # Root layout with AuthProvider
│   │   ├── page.tsx          # Main LMS Dashboard
│   │   └── globals.css       # Design tokens & custom scrollbars
│   ├── components/
│   │   ├── common/           # Brand Logo & shared controls
│   │   ├── dashboard/        # MetricCard, CircularProgress, MonthlyBarChart, WeeklyActivityChart, RecentSessionsTable
│   │   └── layout/           # Sidebar, Header, AppShell (with mobile drawer and bottom bar)
│   ├── context/
│   │   └── AuthContext.tsx   # Client session store & Supabase auth hook
│   ├── data/
│   │   └── mockData.ts       # Accurate data seed matching the blueprint
│   ├── lib/
│   │   └── supabase/         # Supabase client, server helper, and TypeScript schema types
│   └── types/
│       └── index.ts          # Core LMS TypeScript interfaces
├── .env.example              # Template for Supabase & Prisma environment variables
└── package.json
```

---

## 🔌 Connecting Supabase Backend (When Ready)

When you're ready to connect live Supabase keys:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
   ```
3. Push the Prisma database schema to your Supabase PostgreSQL instance:
   ```bash
   npx prisma db push
   ```
4. `src/lib/supabase/client.ts` and `src/context/AuthContext.tsx` will automatically detect the keys and route authentication through Supabase Auth!

---

## 🏃 Running Locally

```bash
# Install dependencies (already installed)
npm install

# Run development server
npm run dev

# Run production build validation
npm run build
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
