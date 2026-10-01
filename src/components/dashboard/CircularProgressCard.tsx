import React from 'react';

interface LegendItem {
  label: string;
  value: string;
  color: string;
}

interface CircularProgressCardProps {
  title: string;
  percentage: number;
  legend: LegendItem[];
  footerNote: string;
}

export const CircularProgressCard: React.FC<CircularProgressCardProps> = ({
  title,
  percentage,
  legend,
  footerNote,
}) => {
  // SVG circular calculation
  const size = 96;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
      {/* Circular Gauge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#edf0ee"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
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
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-base font-bold text-[#111614]">
          {percentage}%
        </span>
      </div>

      {/* Info & Legend */}
      <div className="flex flex-col justify-center flex-1 text-center sm:text-left">
        <h4 className="text-sm font-semibold text-gray-800 mb-2.5">
          {title}
        </h4>

        <div className="space-y-1 mb-2.5">
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center justify-center sm:justify-start gap-2 text-xs">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 font-medium">{item.label}</span>
              <span className="font-semibold text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-600">
          {footerNote}
        </p>
      </div>
    </div>
  );
};
