import Link from 'next/link';
import { BookOpen, CheckCircle, Video, Ticket, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { MetricCardData } from '@/types';

interface MetricCardProps {
  data: MetricCardData;
  onClick?: () => void;
  href?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, onClick, href }) => {
  const renderIcon = () => {
    switch (data.icon) {
      case 'book':
        return <BookOpen className="w-4 h-4 text-[#3ECE92]" />;
      case 'check-circle':
        return <CheckCircle className="w-4 h-4 text-[#3ECE92]" />;
      case 'video':
        return <Video className="w-4 h-4 text-[#3ECE92]" />;
      case 'ticket':
        return <Ticket className="w-4 h-4 text-[#3ECE92]" />;
      case 'users':
        return <Users className="w-4 h-4 text-[#3ECE92]" />;
      case 'trending-up':
        return <TrendingUp className="w-4 h-4 text-[#3ECE92]" />;
      case 'alert-circle':
        return <AlertCircle className="w-4 h-4 text-[#3ECE92]" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#3ECE92]" />;
    }
  };

  const getSubtextColor = () => {
    switch (data.changeType) {
      case 'alert':
      case 'negative':
        return 'text-[#e05252]';
      case 'neutral':
        return 'text-gray-500';
      case 'positive':
      default:
        return 'text-[#10b981]';
    }
  };

  const content = (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 border border-[#eaedf0] shadow-[0_2px_10px_rgba(0,0,0,0.02)] card-hover flex flex-col justify-between h-full ${
        href || onClick ? 'cursor-pointer hover:border-[#3ECE92]/60' : ''
      }`}
    >
      {/* Top row: Title and Icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-700">
          {data.title}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#e8f8f0] flex items-center justify-center border border-[#d1f4e2]/60">
          {renderIcon()}
        </div>
      </div>

      {/* Main value */}
      <div className="mb-2">
        <span className="text-3xl font-bold tracking-tight text-[#111614]">
          {data.value}
        </span>
      </div>

      {/* Bottom change status */}
      <div className="flex items-center text-xs font-medium">
        <span className={getSubtextColor()}>
          {data.changeText}
        </span>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
};
