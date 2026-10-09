import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('========================================================');
  console.log('🚀 PURGING SAMPLE COURSES & SEEDING FLAGSHIP PRODUCT:');
  console.log('   "AI-Native Project Management Program" (AINPM-101)');
  console.log('========================================================\n');

  // 1. Identify Admin User
  const adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  const adminId = adminUser?.id || (await prisma.user.findFirst())?.id;
  if (!adminId) {
    throw new Error('No user found to assign as course instructor');
  }

  // 2. Remove all legacy courses and their associations
  console.log('🗑️  Clearing legacy sample courses (ACA-101, BRM-204, AML-305)...');

  // Remove existing sessions, enrollments, certificates, lessons, modules associated with old courses
  await prisma.attendanceRecord.deleteMany({});
  await prisma.classSession.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.courseModule.deleteMany({});
  await prisma.course.deleteMany({});

  console.log('✅ Legacy courses and associated child records successfully purged.');

  // 3. Create Flagship Course
  console.log('\n📦 Creating Flagship Course: "AI-Native Project Management"...');
  const flagshipCourse = await prisma.course.create({
    data: {
      code: 'AINPM-101',
      title: 'AI-Native Project Management',
      category: 'Executive AI Academy',
      instructorId: adminId,
      description:
        'A founder-led, execution-first 3-month executive program. Master AI Foundations, AI Agents & Orchestration, and Autonomous Project Delivery. Learn. Build. Execute.',
    },
  });
  console.log(`✅ Course Created: ${flagshipCourse.title} (${flagshipCourse.code}) [ID: ${flagshipCourse.id}]`);

  // 4. Create Curriculum Modules and Lessons from PDF Brochure
  console.log('\n📚 Seeding Curriculum Modules and Sub-modules...');

  // --- MODULE 1 ---
  const mod1 = await prisma.courseModule.create({
    data: {
      courseId: flagshipCourse.id,
      title: 'Module 1: AI Foundations (Weeks 1–4)',
      order: 1,
    },
  });

  const mod1Lessons = [
    { title: '1.1 AI Fundamentals (LLMs, Tokens, Context Windows & Reasoning Models)', order: 1, durationMin: 45 },
    { title: '1.2 Context Engineering (CTID & CO-STAR Frameworks, System Prompts)', order: 2, durationMin: 50 },
    { title: '1.3 SOP Engineering (Writing Machine-Readable SOPs & AI Workflows)', order: 3, durationMin: 40 },
    { title: '1.4 AI Builder Stack (Claude Code, Cursor, Lovable, v0 & MCP Basics)', order: 4, durationMin: 60 },
    { title: '1.5 Build: First Production-Ready AI Agent Architecture', order: 5, durationMin: 75 },
    { title: '1.6 Mini Challenge: Real-World Business AI Assistant Walkthrough', order: 6, durationMin: 45 },
  ];

  for (const les of mod1Lessons) {
    await prisma.lesson.create({
      data: {
        moduleId: mod1.id,
        title: les.title,
        order: les.order,
        durationMin: les.durationMin,
        videoUrl: 'https://example.com/videos/module-1-lesson',
      },
    });
  }
  console.log(`  ✓ Module 1: AI Foundations seeded with ${mod1Lessons.length} lessons`);

  // --- MODULE 2 ---
  const mod2 = await prisma.courseModule.create({
    data: {
      courseId: flagshipCourse.id,
      title: 'Module 2: AI Agents & Orchestration (Weeks 5–8)',
      order: 2,
    },
  });

  const mod2Lessons = [
    { title: '2.1 AI Workflow Automation (n8n Fundamentals, Webhooks, APIs & Integrations)', order: 1, durationMin: 55 },
    { title: '2.2 Knowledge & Memory Systems (RAG, Vector DBs, Context Retrieval)', order: 2, durationMin: 60 },
    { title: '2.3 Multi-Agent Systems & Architecture (Manager, Specialist & Worker Agents)', order: 3, durationMin: 65 },
    { title: '2.4 Business Automation Workflows (Sales, Marketing, Operations Pipelines)', order: 4, durationMin: 50 },
    { title: '2.5 Build: Production-Ready Multi-Agent Workflow Deployment', order: 5, durationMin: 80 },
    { title: '2.6 Mini Challenge: End-to-End Business Process Automation System', order: 6, durationMin: 50 },
  ];

  for (const les of mod2Lessons) {
    await prisma.lesson.create({
      data: {
        moduleId: mod2.id,
        title: les.title,
        order: les.order,
        durationMin: les.durationMin,
        videoUrl: 'https://example.com/videos/module-2-lesson',
      },
    });
  }
  console.log(`  ✓ Module 2: AI Agents & Orchestration seeded with ${mod2Lessons.length} lessons`);

  // --- MODULE 3 ---
  const mod3 = await prisma.courseModule.create({
    data: {
      courseId: flagshipCourse.id,
      title: 'Module 3: AI-Native Project Management (Weeks 9–12)',
      order: 3,
    },
  });

  const mod3Lessons = [
    { title: '3.1 Narrow-First Playbook (Opportunity Assessment & Scoring Models)', order: 1, durationMin: 45 },
    { title: '3.2 Tiered Autonomy Framework (Observe → Advise → Recommend → Act)', order: 2, durationMin: 55 },
    { title: '3.3 AI Quality & Validation (Shadow Mode, LLM-as-a-Judge, Quality Gates)', order: 3, durationMin: 60 },
    { title: '3.4 The PM as Execution Architect (WBS, RACI for AI Agents, Dashboards)', order: 4, durationMin: 50 },
    { title: '3.5 Build: AI-Powered Project System for a Real GTM Initiative', order: 5, durationMin: 85 },
    { title: '3.6 Mini Challenge: AI-Native Go-to-Market Execution Plan & Delivery', order: 6, durationMin: 60 },
  ];

  for (const les of mod3Lessons) {
    await prisma.lesson.create({
      data: {
        moduleId: mod3.id,
        title: les.title,
        order: les.order,
        durationMin: les.durationMin,
        videoUrl: 'https://example.com/videos/module-3-lesson',
      },
    });
  }
  console.log(`  ✓ Module 3: AI-Native Project Management seeded with ${mod3Lessons.length} lessons`);

  // 5. Enroll Learners
  console.log('\n👥 Enrolling learners into the flagship course...');
  const learners = await prisma.user.findMany({
    where: { role: 'LEARNER' },
  });

  for (const learner of learners) {
    await prisma.enrollment.create({
      data: {
        userId: learner.id,
        courseId: flagshipCourse.id,
        progress: 33.3, // Module 1 mostly done
      },
    });
  }
  console.log(`✅ Enrolled ${learners.length} learners into ${flagshipCourse.title}.`);

  // 6. Seed Sessions
  console.log('\n📅 Seeding Live Lectures & Recordings for flagship course...');
  await prisma.classSession.createMany({
    data: [
      {
        course: flagshipCourse.title,
        title: 'Masterclass: Context Engineering & The CTID Framework',
        type: 'RECORDING',
        status: 'Closed',
        startTime: new Date('2026-08-10T10:00:00Z'),
        durationMinutes: 90,
        recordingUrl: 'https://example.com/recordings/context-engineering',
      },
      {
        course: flagshipCourse.title,
        title: 'Workshop: SOP Engineering & Machine-Actionable Documentation',
        type: 'RECORDING',
        status: 'Closed',
        startTime: new Date('2026-08-18T14:00:00Z'),
        durationMinutes: 75,
        recordingUrl: 'https://example.com/recordings/sop-engineering',
      },
      {
        course: flagshipCourse.title,
        title: 'Live Lab: Multi-Agent Topology & n8n Orchestration Architecture',
        type: 'LIVE',
        status: 'In Progress',
        startTime: new Date(),
        durationMinutes: 90,
        meetingUrl: 'https://meet.aivalytics.com/live-orchestration-lab',
      },
      {
        course: flagshipCourse.title,
        title: 'Cohort Review: Tiered Autonomy Framework & Decision Rights Mapping',
        type: 'LIVE',
        status: 'Upcoming',
        startTime: new Date(Date.now() + 86400000 * 3),
        durationMinutes: 90,
        meetingUrl: 'https://meet.aivalytics.com/tiered-autonomy-review',
      },
    ],
  });
  console.log('✅ Live & recorded sessions seeded.');

  // 7. Seed Official Program Certificates
  console.log('\n🎓 Seeding Professional Certifications...');
  const alexUser = learners.find((l) => l.email === 'alex.morgan@aivalytics.com') || learners[0];
  if (alexUser) {
    await prisma.certificate.create({
      data: {
        credentialId: 'AIV-2026-AIF-98214',
        userId: alexUser.id,
        courseId: flagshipCourse.id,
        grade: '96% (Distinction)',
        issueDate: new Date('2026-08-25'),
      },
    });
    console.log(`✅ Seeded "AI Foundations Certified" for ${alexUser.fullName}`);
  }

  // Also update ClassSession and SupportTicket defaults if applicable
  await prisma.classSession.updateMany({
    data: { course: 'AI-Native Project Management' },
  });
  await prisma.supportTicket.updateMany({
    data: { course: 'AI-Native Project Management' },
  });

  console.log('\n========================================================');
  console.log('🎉 FLAGSHIP PRODUCT SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding flagship course:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
