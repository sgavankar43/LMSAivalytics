'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { mockCourses } from '@/data/mockData';
import { Course } from '@/types';
import Link from 'next/link';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  Play,
  Search,
  Filter,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Core Curriculum', 'Analytics & Management', 'Data Science & AI'];

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'All' || course.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
              My Courses
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Track your enrolled syllabi, lecture modules, and certification milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#e8f8f0] text-[#059669]">
              3 Enrolled Courses
            </span>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl p-4 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enrolled courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f8faf9] text-xs sm:text-sm text-gray-900 rounded-xl pl-9 pr-4 py-2 border border-gray-200/70 focus:outline-none focus:border-[#3ECE92]"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  filterCategory === cat
                    ? 'bg-[#121614] text-white shadow-xs'
                    : 'bg-[#f4f6f5] text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col justify-between card-hover group"
            >
              {/* Card Header & Banner */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#e8f8f0] text-[#059669]">
                    {course.code}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {course.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-[#059669] transition-colors leading-snug">
                  {course.title}
                </h3>

                <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-[#f1f3f2] flex items-center justify-center text-gray-600 text-[10px] font-bold">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{course.instructor}</p>
                    <p className="text-[10px] text-gray-400">{course.instructorRole}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-500">Progress</span>
                    <span className="font-bold text-[#111614]">{course.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3ECE92] rounded-full transition-all duration-500"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 pt-0.5 font-mono">
                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                    <span>{course.completedModules}/{course.totalModules} modules</span>
                  </div>
                </div>

                {/* Next Lesson Indicator */}
                {course.nextLesson && (
                  <div className="mt-4 p-2.5 bg-[#f8faf9] rounded-xl border border-gray-100 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#3ECE92] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                        Up Next
                      </span>
                      <span className="text-xs font-medium text-gray-800 line-clamp-1">
                        {course.nextLesson}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer CTA */}
              <div className="p-4 bg-[#fafbfb] border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{course.totalHours}</span>
                </div>

                <Link
                  href={`/courses/${course.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#121614] text-white hover:bg-black transition-all group-hover:bg-[#3ECE92] group-hover:text-[#111614]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
