'use client';

import React, { useState } from 'react';
import { MonthlyAttendance } from '@/types';

interface MonthlyBarChartProps {
  data: MonthlyAttendance[];
  year?: string;
}

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data,
  year = '2026',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = 12;
  const yTicks = [12, 9, 6, 3, 0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-800">
          Sessions attended by month
        </h3>
        <span className="text-xs font-mono text-gray-400 font-medium">
          {year}
        </span>
      </div>

      {/* Chart Container */}
      <div className="relative h-56 w-full flex">
        {/* Y Axis ticks */}
        <div className="w-6 flex flex-col justify-between text-[11px] font-mono text-gray-400 pb-6 pr-2 select-none text-right">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        {/* Main Chart Canvas with grid lines and bars */}
        <div className="flex-1 relative flex flex-col justify-between pb-6">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
            {yTicks.map((tick) => (
              <div
                key={tick}
                className="w-full border-b border-gray-100"
              />
            ))}
          </div>

          {/* Bars container */}
          <div className="relative z-10 h-full flex items-end justify-between gap-1.5 sm:gap-3 px-1 sm:px-2">
            {data.map((item, idx) => {
              const heightPercent = Math.min(100, (item.count / maxValue) * 100);
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={item.shortMonth}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-9 z-20 bg-[#121614] text-white text-[11px] font-medium py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in duration-150">
                      {item.month}: <span className="text-[#3ECE92] font-semibold">{item.count}</span> sessions
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    className={`w-full max-w-[18px] sm:max-w-[22px] rounded-t-md transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#2ec584] scale-y-[1.02]'
                        : 'bg-[#6fe3b1] hover:bg-[#3ece92]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Month Label */}
                  <span
                    className={`text-[10px] sm:text-[11px] mt-2 transition-colors select-none ${
                      isHovered ? 'text-gray-900 font-semibold' : 'text-gray-400'
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
