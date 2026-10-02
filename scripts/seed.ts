import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env variables manually or using process.loadEnvFile
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const prisma = new PrismaClient();

async function getOrCreateAuthUser(email: string, password: string, fullName: string) {
  const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing auth users:', listError);
  }

  const existing = listData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    console.log(`User ${email} already exists in Supabase Auth (${existing.id}). Updating password...`);
    await supabaseAdmin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    return existing.id;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
  }

  console.log(`Created Supabase Auth user ${email} (${data.user.id})`);
  return data.user.id;
}

async function main() {
  console.log('--- Seeding AIvalytics LMS Database & Supabase Auth ---');

  // 1. Create Seed Auth Users (4 Generic Learners + Admin)
  const alexId = await getOrCreateAuthUser(
    'alex.morgan@aivalytics.com',
    'password123',
    'Alex Morgan'
  );

  const sarahId = await getOrCreateAuthUser(
    'sarah.connor@aivalytics.com',
    'password123',
    'Sarah Connor'
  );

  const davidId = await getOrCreateAuthUser(
    'david.miller@aivalytics.com',
    'password123',
    'David Miller'
  );

  const emilyId = await getOrCreateAuthUser(
    'emily.watson@aivalytics.com',
    'password123',
    'Emily Watson'
  );

  const adminId = await getOrCreateAuthUser(
    'admin@aivalytics.com',
    'password123',
    'Admin Faculty'
  );

  // 2. Upsert Users in Postgres DB
  console.log('Upserting Users into Prisma Database...');
  const genericLearners = [
    { id: alexId, email: 'alex.morgan@aivalytics.com', fullName: 'Alex Morgan' },
    { id: sarahId, email: 'sarah.connor@aivalytics.com', fullName: 'Sarah Connor' },
    { id: davidId, email: 'david.miller@aivalytics.com', fullName: 'David Miller' },
    { id: emilyId, email: 'emily.watson@aivalytics.com', fullName: 'Emily Watson' },
  ];

  for (const learner of genericLearners) {
    await prisma.user.upsert({
      where: { id: learner.id },
      update: {
        email: learner.email,
        fullName: learner.fullName,
        role: 'LEARNER',
        term: 'Fall 2026',
      },
      create: {
        id: learner.id,
        email: learner.email,
        fullName: learner.fullName,
        role: 'LEARNER',
        term: 'Fall 2026',
      },
    });
  }

  const learnerId = alexId;

  await prisma.user.upsert({
    where: { id: adminId },
    update: {
      email: 'admin@aivalytics.com',
      fullName: 'Admin Faculty',
      role: 'ADMIN',
      term: 'Academic Year 2026',
    },
    create: {
      id: adminId,
      email: 'admin@aivalytics.com',
      fullName: 'Admin Faculty',
      role: 'ADMIN',
      term: 'Academic Year 2026',
    },
  });

  // 3. Upsert Courses
  console.log('Upserting Courses...');
  const course1 = await prisma.course.upsert({
    where: { code: 'ACA-101' },
    update: {},
    create: {
      code: 'ACA-101',
      title: 'Academic Information & Governance',
      category: 'Core Curriculum',
      instructorId: adminId,
      description:
        'Foundational framework covering institutional policies, academic integrity, degree roadmaps, and student evaluation guidelines.',
    },
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'BRM-204' },
    update: {},
    create: {
      code: 'BRM-204',
      title: 'Business Research Methodologies',
      category: 'Analytics & Management',
      instructorId: adminId,
      description:
        'Comprehensive research lifecycle from hypothesis formulation and sampling paradigms to quantitative regression models and reporting.',
    },
  });

  const course3 = await prisma.course.upsert({
    where: { code: 'AML-305' },
    update: {},
    create: {
      code: 'AML-305',
      title: 'Applied AI & Neural Predictive Analytics',
      category: 'Data Science & AI',
      instructorId: adminId,
      description:
        'Practical deep dive into machine learning workflows, embedding spaces, agentic systems, and deployment to serverless production environments.',
    },
  });

  // 4. Enroll Learner
  console.log('Enrolling learner in courses...');
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: learnerId,
        courseId: course1.id,
      },
    },
    update: { progress: 42.0 },
    create: {
      userId: learnerId,
      courseId: course1.id,
      progress: 42.0,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: learnerId,
        courseId: course2.id,
      },
    },
    update: { progress: 18.0 },
    create: {
      userId: learnerId,
      courseId: course2.id,
      progress: 18.0,
    },
  });

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: learnerId,
        courseId: course3.id,
      },
    },
    update: { progress: 12.0 },
    create: {
      userId: learnerId,
      courseId: course3.id,
      progress: 12.0,
    },
  });

  // 5. Upsert Sessions
  console.log('Seeding Live and Recorded Sessions...');
  await prisma.session.deleteMany({ where: { courseId: course1.id } });
  await prisma.session.createMany({
    data: [
      {
        courseId: course1.id,
        title: 'Orientation & Program Overview',
        type: 'RECORDING',
        status: 'CLOSED',
        scheduledAt: new Date('2026-08-04T10:00:00Z'),
        durationMinutes: 90,
        recordingUrl: 'https://example.com/recordings/orientation',
      },
      {
        courseId: course1.id,
        title: 'Session 1: Academic Policies',
        type: 'RECORDING',
        status: 'CLOSED',
        scheduledAt: new Date('2026-08-11T14:00:00Z'),
        durationMinutes: 75,
        recordingUrl: 'https://example.com/recordings/academic-policies',
      },
      {
        courseId: course1.id,
        title: 'Session 2: Grading & Evaluation',
        type: 'LIVE',
        status: 'IN_PROGRESS',
        scheduledAt: new Date(),
        durationMinutes: 90,
        meetingUrl: 'https://meet.aivalytics.com/session-grading-eval',
      },
    ],
  });

  // 6. Upsert Support Tickets
  console.log('Seeding Support Tickets...');
  await prisma.supportTicket.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: [
          'admin@aivalytics.com',
          'alex.morgan@aivalytics.com',
          'sarah.connor@aivalytics.com',
          'david.miller@aivalytics.com',
          'emily.watson@aivalytics.com',
        ],
      },
    },
  });
  await prisma.supportTicket.createMany({
    data: [
      {
        ticketCode: 'TKT-8492',
        userId: learnerId,
        courseId: course2.id,
        subject: 'Access permission issue for Session 1 Quiz on Research Design',
        description:
          'When clicking on the Session 1 graded quiz submission link, the portal returns permission error 403. Need access verified before Sunday midnight cutoff.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
      {
        ticketCode: 'TKT-8488',
        userId: learnerId,
        courseId: course1.id,
        subject: 'Recording download audio desync in Academic Policies lecture',
        description:
          'The downloadable MP4 lecture video has a 2-second audio delay around timestamp 34:10 during the honor code presentation.',
        status: 'OPEN',
        priority: 'MEDIUM',
      },
    ],
  });

  // 7. Upsert Certificates
  console.log('Seeding Certificates...');
  await prisma.certificate.create({
    data: {
      credentialId: 'AIV-2026-DL-98214',
      userId: learnerId,
      courseId: course1.id,
      grade: '94% (Distinction)',
      issueDate: new Date('2026-07-15'),
    },
  });

  console.log('\n✅ Database and Supabase Auth seeded successfully!');
  console.log('=============================================');
  console.log('TEST CREDENTIALS:');
  console.log('Generic Learner Accounts:');
  console.log('  1. Alex Morgan:    alex.morgan@aivalytics.com   (password123)');
  console.log('  2. Sarah Connor:   sarah.connor@aivalytics.com  (password123)');
  console.log('  3. David Miller:   david.miller@aivalytics.com  (password123)');
  console.log('  4. Emily Watson:   emily.watson@aivalytics.com  (password123)');
  console.log('\nAdmin Faculty Account:');
  console.log('  Admin:             admin@aivalytics.com         (password123)');
  console.log('=============================================');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
