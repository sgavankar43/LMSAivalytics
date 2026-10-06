import React from 'react';
import { Award, Ticket, BookOpen, Video, UserCheck } from 'lucide-react';

interface MiniStatCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  icon: 'award' | 'ticket' | 'book' | 'video' | 'user-check';
  gaugeColor?: string;
}

export const MiniStatCard: React.FC<MiniStatCardProps> = ({
  title,
  subtitle,
  percentage,
  icon,
  gaugeColor = '#3ECE92',
}) => {
  const size = 50;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  const renderIcon = () => {
    switch (icon) {
      case 'award':
        return <Award className="w-4 h-4 text-[#059669]" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-[#059669]" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-[#059669]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#059669]" />;
      case 'user-check':
        return <UserCheck className="w-4 h-4 text-[#059669]" />;
      default:
        return <Award className="w-4 h-4 text-[#059669]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover flex items-center justify-between gap-3 transition-all hover:border-gray-300">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Icon box */}
        <div className="w-9 h-9 rounded-xl bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60 shrink-0">
          {renderIcon()}
        </div>

        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-gray-800 truncate">
            {title}
          </h4>
          <p className="text-[11px] text-gray-400 mt-0.5 font-medium truncate">
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
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-800 ease-out"
          />
        </svg>
        <span className="absolute text-[11px] font-bold text-gray-800 font-mono">
          {percentage}%
        </span>
      </div>
    </div>
  );
};
