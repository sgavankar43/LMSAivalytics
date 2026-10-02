'use client';

import React, { useState } from 'react';

interface EngagementDataPoint {
  month: string;
  shortMonth: string;
  attendance: number;
  quizzes: number;
}

const mockEngagement: EngagementDataPoint[] = [
  { month: 'January', shortMonth: 'Jan', attendance: 78, quizzes: 65 },
  { month: 'February', shortMonth: 'Feb', attendance: 82, quizzes: 74 },
  { month: 'March', shortMonth: 'Mar', attendance: 75, quizzes: 70 },
  { month: 'April', shortMonth: 'Apr', attendance: 88, quizzes: 84 },
  { month: 'May', shortMonth: 'May', attendance: 85, quizzes: 80 },
  { month: 'June', shortMonth: 'Jun', attendance: 92, quizzes: 89 },
  { month: 'July', shortMonth: 'Jul', attendance: 80, quizzes: 76 },
  { month: 'August', shortMonth: 'Aug', attendance: 95, quizzes: 91 },
  { month: 'September', shortMonth: 'Sep', attendance: 86, quizzes: 82 },
  { month: 'October', shortMonth: 'Oct', attendance: 79, quizzes: 75 },
  { month: 'November', shortMonth: 'Nov', attendance: 89, quizzes: 87 },
  { month: 'December', shortMonth: 'Dec', attendance: 74, quizzes: 69 },
];

export const AdminEngagementChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = 100;
  const yTicks = [100, 75, 50, 25, 0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">
            Institution Student Engagement Trends
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Monthly live attendance vs milestone quiz participation rate (%)
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono select-none">
          <span className="flex items-center gap-1.5 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3ECE92]" />
            <span>Attendance %</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-700">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#121614]" />
            <span>Quiz Rate %</span>
          </span>
          <span className="text-gray-400 font-semibold pl-2 border-l border-gray-200">
            2026
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="relative h-60 w-full flex">
        {/* Y Axis ticks */}
        <div className="w-8 flex flex-col justify-between text-[11px] font-mono text-gray-400 pb-6 pr-2 select-none text-right">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}%</span>
          ))}
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative flex flex-col justify-between pb-6">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
            {yTicks.map((tick) => (
              <div key={tick} className="w-full border-b border-gray-100" />
            ))}
          </div>

          {/* Dual Bar Pairs */}
          <div className="relative z-10 h-full flex items-end justify-between gap-1 sm:gap-2 px-1 sm:px-2">
            {mockEngagement.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              const attHeight = (item.attendance / maxValue) * 100;
              const quizHeight = (item.quizzes / maxValue) * 100;

              return (
                <div
                  key={item.shortMonth}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-[#121614] text-white text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-xl whitespace-nowrap animate-in fade-in duration-150 text-center">
                      <p className="font-bold text-[#3ECE92]">{item.month}</p>
                      <p className="text-[10px] text-gray-300">
                        Attendance: <strong>{item.attendance}%</strong> | Quizzes: <strong>{item.quizzes}%</strong>
                      </p>
                    </div>
                  )}

                  {/* Dual Bar Container */}
                  <div className="flex items-end gap-1 w-full justify-center">
                    <div
                      className={`w-2 sm:w-2.5 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'bg-[#2ec584]' : 'bg-[#5ae4a8]'
                      }`}
                      style={{ height: `${attHeight}%` }}
                    />
                    <div
                      className={`w-2 sm:w-2.5 rounded-t-sm transition-all duration-200 ${
                        isHovered ? 'bg-black' : 'bg-[#121614]/80'
                      }`}
                      style={{ height: `${quizHeight}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] mt-2 transition-colors select-none ${
                      isHovered ? 'text-gray-900 font-bold' : 'text-gray-400'
                    }`}
                  >
                    {item.shortMonth}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
