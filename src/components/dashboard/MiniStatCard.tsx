import React from 'react';
import { Award, Ticket } from 'lucide-react';

interface MiniStatCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  icon: 'award' | 'ticket';
}

export const MiniStatCard: React.FC<MiniStatCardProps> = ({
  title,
  subtitle,
  percentage,
  icon,
}) => {
  const size = 52;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Icon box */}
        <div className="w-10 h-10 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60 shrink-0">
          {icon === 'award' ? (
            <Award className="w-5 h-5 text-[#3ECE92]" />
          ) : (
            <Ticket className="w-5 h-5 text-[#3ECE92]" />
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-800">
            {title}
          </h4>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Mini Gauge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#edf0ee"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#3ECE92"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-800 ease-out"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-gray-800">
          {percentage}%
        </span>
      </div>
    </div>
  );
};
