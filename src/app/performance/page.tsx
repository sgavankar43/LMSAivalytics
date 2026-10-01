'use client';

import React from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { mockCertificates, mockCourses } from '@/data/mockData';
import {
  Award,
  Download,
  TrendingUp,
  CheckCircle,
  FileCheck,
  Calendar,
  Sparkles,
  BarChart2,
} from 'lucide-react';

export default function PerformancePage() {
  const grades = [
    { course: 'Academic Information & Governance', quiz: '92%', assignment: '88%', exam: '94%', overall: '91.3%' },
    { course: 'Business Research Methodologies', quiz: '85%', assignment: '82%', exam: 'Pending', overall: '83.5%' },
    { course: 'Applied AI & Neural Analytics', quiz: '96%', assignment: '90%', exam: 'Pending', overall: '93.0%' },
  ];

  return (
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111614]">
              Performance & Credentials
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Review cumulative academic records, grade breakdowns, and verified completion credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#e8f8f0] text-[#059669] flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>GPA: 3.84 / 4.0</span>
            </span>
          </div>
        </div>

        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-xs font-medium text-gray-400">Average Quiz Score</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">91.0%</span>
              <span className="text-xs font-semibold text-[#059669]">↑ Top 5%</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Across 14 assessed milestone quizzes</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-xs font-medium text-gray-400">Live Seminar Attendance</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">82.0%</span>
              <span className="text-xs font-semibold text-[#059669]">Consistent</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Target is minimum 75% for honors</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <span className="text-xs font-medium text-gray-400">Program Certificates</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">1 / 3</span>
              <span className="text-xs font-semibold text-[#059669]">33% Completed</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">2 programs currently in active study</p>
          </div>
        </div>

        {/* Course Grades Breakdown */}
        <div className="bg-white rounded-2xl border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">
              Grade & Evaluation Breakdown
            </h3>
            <span className="text-xs text-gray-400 font-mono">Term: Fall 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-[#fafbfb]/60">
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-6">Quizzes</th>
                  <th className="py-3 px-6">Assignments</th>
                  <th className="py-3 px-6">Term Exam</th>
                  <th className="py-3 px-6 text-right">Cumulative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">{item.course}</td>
                    <td className="py-4 px-6 font-mono text-gray-700">{item.quiz}</td>
                    <td className="py-4 px-6 font-mono text-gray-700">{item.assignment}</td>
                    <td className="py-4 px-6 font-mono text-gray-500">{item.exam}</td>
                    <td className="py-4 px-6 font-mono font-bold text-right text-[#059669]">
                      {item.overall}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Certificates & Verified Badges */}
        <div className="bg-white rounded-2xl border border-[#eaedf0] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Issued Certificates & Verification
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Official encrypted digital credentials issued by AIvalytics Faculty.
              </p>
            </div>
            <Award className="w-5 h-5 text-[#3ECE92]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {mockCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl border border-gray-100 bg-[#f8faf9] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        cert.status === 'Issued'
                          ? 'bg-[#e8f8f0] text-[#059669]'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cert.status}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{cert.grade}</span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 leading-snug">
                    {cert.title}
                  </h4>
                  <p className="text-[11px] font-mono text-gray-400 mt-1">
                    ID: {cert.credentialId}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">{cert.issueDate}</span>
                  {cert.status === 'Issued' ? (
                    <button
                      onClick={() => alert('Downloading official PDF certificate: ' + cert.credentialId)}
                      className="text-xs font-semibold text-[#059669] hover:underline flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">In progress</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
