'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { mockCourses } from '@/data/mockData';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Circle,
  FileText,
  Download,
  MessageSquare,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const course = mockCourses.find((c) => c.id === courseId) || mockCourses[0];

  const [activeLessonId, setActiveLessonId] = useState('l_1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources' | 'discussion'>('overview');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['l_1', 'l_2']);

  const modules = [
    {
      id: 'm_1',
      title: 'Module 1: Orientation & Foundations',
      lessons: [
        { id: 'l_1', title: '1.1 Institutional Policies & Honor Code', duration: '28m', type: 'video' },
        { id: 'l_2', title: '1.2 Degree Roadmaps & Credit Milestones', duration: '34m', type: 'video' },
        { id: 'l_3', title: '1.3 Academic Integrity & Citation Standards', duration: '45m', type: 'video' },
      ],
    },
    {
      id: 'm_2',
      title: 'Module 2: Governance & Evaluation Architecture',
      lessons: [
        { id: 'l_4', title: '2.1 Grading Rubrics & Peer Assessment Protocols', duration: '40m', type: 'video' },
        { id: 'l_5', title: '2.2 Faculty Review Cycles & Appeal Procedures', duration: '32m', type: 'video' },
        { id: 'l_6', title: '2.3 Continuous Learning Evaluation Framework', duration: '50m', type: 'video' },
      ],
    },
  ];

  const currentLesson =
    modules.flatMap((m) => m.lessons).find((l) => l.id === activeLessonId) || modules[0].lessons[0];

  const toggleLessonComplete = (id: string) => {
    if (completedLessonIds.includes(id)) {
      setCompletedLessonIds(completedLessonIds.filter((item) => item !== id));
    } else {
      setCompletedLessonIds([...completedLessonIds, id]);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/courses')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Courses</span>
          </button>

          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-[#e8f8f0] text-[#059669]">
            {course.code}
          </span>
        </div>

        {/* Course Title Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {course.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Instructor: <span className="font-semibold text-gray-800">{course.instructor}</span> ({course.instructorRole})
          </p>
        </div>

        {/* Classroom Grid: Video Player + Curriculum Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video & Content Viewer (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mock High-Res Video Player */}
            <div className="bg-[#121614] rounded-2xl aspect-video w-full overflow-hidden relative flex flex-col justify-between p-6 shadow-xl border border-gray-800 text-white">
              {/* Top Video Header */}
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                  {currentLesson.title}
                </span>
                <span className="bg-[#3ECE92]/20 text-[#3ECE92] border border-[#3ECE92]/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  HD 1080p
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-[#3ECE92] hover:bg-[#34be83] text-[#111614] flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls Bar */}
              <div className="space-y-2">
                {/* Progress bar */}
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div className="bg-[#3ECE92] h-full w-2/5 rounded-full" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>14:20 / {currentLesson.duration}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] hover:text-white cursor-pointer">1.0x</span>
                    <button
                      onClick={() => toggleLessonComplete(currentLesson.id)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        completedLessonIds.includes(currentLesson.id)
                          ? 'bg-[#3ECE92] text-[#111614] font-semibold'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {completedLessonIds.includes(currentLesson.id) ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs (Overview, Notes, Resources, Q&A) */}
            <div className="bg-white rounded-2xl border border-[#eaedf0] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 gap-6 text-xs sm:text-sm font-semibold mb-4">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'notes', label: 'Lecture Notes' },
                  { id: 'resources', label: 'Downloads & Materials' },
                  { id: 'discussion', label: 'Faculty Q&A' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`pb-3 transition-colors relative ${
                      activeTab === tab.id
                        ? 'text-[#059669]'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3ECE92] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <p>
                    This session dives into foundational paradigms, institutional guidelines, and learning roadmap objectives. Students are advised to take active notes and review the accompanying reading syllabus.
                  </p>
                  <div className="bg-[#f8faf9] p-4 rounded-xl border border-gray-100 mt-3">
                    <h5 className="font-semibold text-gray-900 text-xs mb-1">Key Learning Objectives:</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                      <li>Understand institutional governance and milestone criteria</li>
                      <li>Review honor code protocols and ethical citations</li>
                      <li>Prepare for upcoming live interactive seminar sessions</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="text-xs text-gray-600 space-y-2">
                  <p><strong>Note 1:</strong> Always cross-reference the credit handbook for semester prerequisites.</p>
                  <p><strong>Note 2:</strong> Late submissions without prior faculty clearance incur a 10% penalty per calendar day.</p>
                </div>
              )}

              {activeTab === 'resources' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#3ECE92]" />
                      <span className="text-xs font-semibold text-gray-800">Lecture_Slides_Week1.pdf</span>
                    </div>
                    <button className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#3ECE92]" />
                      <span className="text-xs font-semibold text-gray-800">Academic_Policies_Handbook.pdf</span>
                    </div>
                    <button className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'discussion' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask the faculty or peers a question..."
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#3ECE92]"
                    />
                    <button className="bg-[#121614] text-white px-4 py-2 rounded-xl text-xs font-semibold">
                      Post
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 text-center py-4">
                    No questions posted yet for this lesson. Be the first to start the discussion!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Sidebar (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#eaedf0] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Course Syllabus
              </h3>

              <div className="space-y-4">
                {modules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {mod.title}
                    </h4>

                    <div className="space-y-1">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = lesson.id === activeLessonId;
                        const isCompleted = completedLessonIds.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                              isCurrent
                                ? 'bg-[#e8f8f0] text-[#059669] font-semibold border border-[#d1f4e2]'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLessonComplete(lesson.id);
                                }}
                                className="text-gray-400 hover:text-[#3ECE92]"
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4 text-[#3ECE92] fill-[#3ECE92]/20" />
                                ) : (
                                  <Circle className="w-4 h-4" />
                                )}
                              </button>
                              <span className="text-xs line-clamp-1">{lesson.title}</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0 ml-2">
                              {lesson.duration}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
