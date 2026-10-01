import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-xl',
  }[size];

  const dotDimensions = {
    sm: 'w-2 h-2 rounded-[2px]',
    md: 'w-3 h-3 rounded-[3px]',
    lg: 'w-3.5 h-3.5 rounded-sm',
  }[size];

  const textSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-lg font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight',
  }[size];

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 group select-none ${className}`}
    >
      <div
        className={`${iconDimensions} bg-[#3ECE92] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}
      >
        <div className={`${dotDimensions} bg-[#121614]`} />
      </div>
      {showText && (
        <span className={`${textSizes} text-[#111614] font-sans font-semibold tracking-[-0.02em]`}>
          AIvalytics
        </span>
      )}
    </Link>
  );
};
