'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useCourses } from '@/context/CourseContext';
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
  Check,
  Award,
  Layers,
  Send,
  BookOpen,
} from 'lucide-react';

export default function CourseDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    activeCourse,
    modules,
    isLessonCompleted,
    toggleLessonComplete,
    courseProgress,
    completedLessonsCount,
    totalLessons,
  } = useCourses();

  const allSubmodules = modules.flatMap((m) => m.submodules);
  const initialLessonParam = searchParams.get('lesson');

  const [activeLessonId, setActiveLessonId] = useState<string>(
    initialLessonParam || allSubmodules[0]?.id || 'sub_1_1'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'resources' | 'discussion'>('overview');

  // Question form state
  const [questionText, setQuestionText] = useState('');
  const [qaFeedback, setQaFeedback] = useState<string | null>(null);

  // Sync with search param if changed
  useEffect(() => {
    const lessonParam = searchParams.get('lesson');
    if (lessonParam && allSubmodules.some((s) => s.id === lessonParam)) {
      setActiveLessonId(lessonParam);
    }
  }, [searchParams, allSubmodules]);

  const currentLesson =
    allSubmodules.find((l) => l.id === activeLessonId) || allSubmodules[0];

  const currentParentModule = modules.find((m) =>
    m.submodules.some((s) => s.id === currentLesson?.id)
  );

  const isCompleted = currentLesson ? isLessonCompleted(currentLesson.id) : false;

  const handleToggleComplete = () => {
    if (currentLesson) {
      toggleLessonComplete(currentLesson.id);
    }
  };

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQaFeedback('Your question was transmitted to Admin Faculty. You will receive an answer in your notification center.');
    setQuestionText('');
    setTimeout(() => setQaFeedback(null), 5000);
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
            <span>Back to Curriculum Hub</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-[#e8f8f0] text-[#059669]">
              {activeCourse.code}
            </span>
            <span className="text-xs font-mono text-gray-500">
              {courseProgress}% completed
            </span>
          </div>
        </div>

        {/* Course Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#059669] font-bold">
              <span>Module {currentParentModule?.moduleNumber || 1}: {currentParentModule?.title}</span>
              <span>•</span>
              <span>Part {currentLesson?.subpartCode}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5">
              {currentLesson?.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Instructor: <span className="font-semibold text-gray-800">{activeCourse.instructor}</span> ({activeCourse.instructorRole})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleComplete}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                  : 'bg-[#121614] text-white hover:bg-black'
              }`}
            >
              {isCompleted ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Mark Complete</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Classroom Grid: Video Player + Curriculum Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video & Content Viewer (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* High-Res Video Player */}
            <div className="bg-[#121614] rounded-2xl aspect-video w-full overflow-hidden relative flex flex-col justify-between p-6 shadow-xl border border-gray-800 text-white">
              {/* Top Video Header */}
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span className="bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs font-medium border border-white/10">
                  Part {currentLesson?.subpartCode}: {currentLesson?.title}
                </span>
                <span className="bg-[#3ECE92]/20 text-[#3ECE92] border border-[#3ECE92]/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
                  HD 1080p • {currentLesson?.duration}
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
                  <div className="bg-[#3ECE92] h-full w-2/5 rounded-full shadow-[0_0_8px_rgba(62,206,146,0.6)]" />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>18:40 / {currentLesson?.duration}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] hover:text-white cursor-pointer">1.0x</span>
                    <button
                      onClick={handleToggleComplete}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        isCompleted
                          ? 'bg-[#3ECE92] text-[#111614] font-semibold'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {isCompleted ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs (Overview, Notes, Resources, Q&A) */}
            <div className="bg-white rounded-2xl border border-[#eaedf0] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-100 gap-6 text-xs sm:text-sm font-semibold mb-5">
                {[
                  { id: 'overview', label: 'Lesson Overview' },
                  { id: 'notes', label: 'Lecture Notes & SOPs' },
                  { id: 'resources', label: 'Downloads & Frameworks' },
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
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#059669] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 text-sm">
                      About this Syllabus Unit
                    </h3>
                    <p>{currentLesson?.description}</p>
                  </div>

                  {/* Core Takeaways */}
                  {currentLesson?.takeaways && currentLesson.takeaways.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                      <h4 className="font-bold text-gray-900 text-xs uppercase font-mono tracking-wider">
                        Key Framework Takeaways & Outcomes
                      </h4>
                      <ul className="space-y-1.5">
                        {currentLesson.takeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                            <Check className="w-3.5 h-3.5 text-[#059669] shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Quote Banner from Brochure */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#e8f8f0] to-[#f0fbf6] border border-[#d1f4e2] text-[#065f46] text-xs font-medium italic">
                    &ldquo;Great AI systems are built on great context—not great prompts. You don&rsquo;t just learn how execution works. You build and run it.&rdquo;
                  </div>
                </div>
              )}

              {/* Tab 2: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed font-mono">
                  <div className="p-4 bg-gray-900 text-gray-100 rounded-xl border border-gray-800 space-y-2 overflow-x-auto">
                    <div className="text-[11px] text-[#3ECE92] uppercase font-bold tracking-wider">
                      Execution Blueprint & Standard Operating Procedure
                    </div>
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
{`# AI-Native Architecture: ${currentLesson?.title}
# Module: ${currentParentModule?.title}

1. Objective:
   - Convert institutional intent into deterministic, machine-actionable instructions.
   - Anchor reasoning models within structured input/output JSON schemas.

2. Execution Protocols:
   - System prompts must isolate role boundaries and tool permissions.
   - Guardrails prevent hallucination escape vectors and enforce schema validation.
   - Continuous evaluation telemetry benchmarks performance against shadow human runs.`}
                    </pre>
                  </div>
                </div>
              )}

              {/* Tab 3: Downloads & Materials */}
              {activeTab === 'resources' && (
                <div className="space-y-3">
                  {currentLesson?.resources && currentLesson.resources.length > 0 ? (
                    currentLesson.resources.map((res, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[#eaedf0] hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-800">{res.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{res.size || '2.4 MB'} • Downloadable Artifact</p>
                          </div>
                        </div>

                        <a
                          href={res.url}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-xs">
                      All core frameworks are integrated in the overview.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Faculty Q&A */}
              {activeTab === 'discussion' && (
                <div className="space-y-4">
                  {qaFeedback && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-medium border border-emerald-200 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{qaFeedback}</span>
                    </div>
                  )}

                  <form onSubmit={handleSendQuestion} className="space-y-3">
                    <textarea
                      rows={3}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ask Admin Faculty a question about this lesson or framework..."
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#3ECE92]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#121614] hover:bg-black shadow-xs transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Question</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Curriculum Sidebar (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#eaedf0] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Program Syllabus</h3>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {completedLessonsCount} / {totalLessons} units complete
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-[#059669] bg-[#e8f8f0] px-2.5 py-1 rounded-md">
                  {courseProgress}%
                </span>
              </div>

              {/* Module Accordions */}
              <div className="mt-4 space-y-4 max-h-[640px] overflow-y-auto pr-1">
                {modules.map((mod) => (
                  <div key={mod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                      <span>Module {mod.moduleNumber}: {mod.title}</span>
                      <span className="text-[10px] text-gray-400">{mod.weeks}</span>
                    </div>

                    <div className="space-y-1 pl-1">
                      {mod.submodules.map((lesson) => {
                        const isActive = lesson.id === activeLessonId;
                        const isDone = isLessonCompleted(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setActiveLessonId(lesson.id);
                              router.replace(`/courses/${activeCourse.id}?lesson=${lesson.id}`);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 ${
                              isActive
                                ? 'bg-[#121614] text-white shadow-sm font-semibold'
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {isDone ? (
                                <CheckCircle
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive ? 'text-[#3ECE92]' : 'text-emerald-600'
                                  }`}
                                />
                              ) : (
                                <Circle
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive ? 'text-gray-400' : 'text-gray-300'
                                  }`}
                                />
                              )}
                              <span className="truncate">
                                {lesson.subpartCode} {lesson.title}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isActive ? 'text-gray-400' : 'text-gray-400'
                              }`}
                            >
                              {lesson.duration}
                            </span>
                          </button>
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
