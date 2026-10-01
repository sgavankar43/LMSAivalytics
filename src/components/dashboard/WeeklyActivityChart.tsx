'use client';

import React, { useState } from 'react';
import { WeeklyActivity } from '@/types';

interface WeeklyActivityChartProps {
  data: WeeklyActivity[];
}

export const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxY = 8;
  const yTicks = [8, 6, 4, 2, 0];

  // SVG viewBox coordinates
  const svgWidth = 800;
  const svgHeight = 180;
  const paddingLeft = 20;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate points for the smooth spline line
  const points = data.map((item, idx) => {
    const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (item.hours / maxY) * chartHeight;
    return { x, y, item, idx };
  });

  // Generate cubic bezier smooth SVG path
  const generateSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = generateSmoothPath(points);

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">
          Weekly learning activity
        </h3>
        <span className="text-xs font-mono text-gray-400 font-medium">
          Hours studied
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full flex">
        {/* Y Axis Labels */}
        <div className="w-6 flex flex-col justify-between text-[11px] font-mono text-gray-400 pb-9 pt-4 select-none text-right pr-2">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        {/* SVG Canvas Area */}
        <div className="flex-1 relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-48 overflow-visible select-none"
          >
            {/* Horizontal Grid lines */}
            {yTicks.map((tick) => {
              const y = paddingTop + chartHeight - (tick / maxY) * chartHeight;
              return (
                <line
                  key={tick}
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#f1f3f2"
                  strokeWidth="1"
                />
              );
            })}

            {/* Spline Curve */}
            <path
              d={linePath}
              fill="none"
              stroke="#5ae4a8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points and X-axis labels aligned with points */}
            {points.map((pt) => {
              const isHovered = hoveredIdx === pt.idx;
              return (
                <g key={pt.idx}>
                  {/* Hover Hitbox */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(pt.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />

                  {/* Visual Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#3ece92"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-150 pointer-events-none"
                  />

                  {/* Tooltip on SVG */}
                  {isHovered && (
                    <g transform={`translate(${pt.x}, ${pt.y - 14})`}>
                      <rect
                        x="-45"
                        y="-26"
                        width="90"
                        height="24"
                        rx="6"
                        fill="#121614"
                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))"
                      />
                      <text
                        x="0"
                        y="-10"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="600"
                        textAnchor="middle"
                        fontFamily="sans-serif"
                      >
                        {pt.item.week}: <tspan fill="#3ECE92">{pt.item.hours}h</tspan>
                      </text>
                    </g>
                  )}

                  {/* X-axis label directly below point */}
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    fill={isHovered ? '#111827' : '#9ca3af'}
                    fontSize="11"
                    fontWeight={isHovered ? '600' : '400'}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {pt.item.week}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
