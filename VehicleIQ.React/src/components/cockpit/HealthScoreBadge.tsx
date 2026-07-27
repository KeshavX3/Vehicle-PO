import React from 'react';
import { getHealthColor } from '../../utils/healthScore';
import { Activity } from 'lucide-react';

interface HealthScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function HealthScoreBadge({ score, size = 'md', showLabel = true }: HealthScoreBadgeProps) {
  const { text, bg, border } = getHealthColor(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono font-bold rounded-lg border backdrop-blur-sm ${bg} ${text} ${border} ${sizeClasses[size]}`}>
      <Activity className="w-3.5 h-3.5 animate-pulse" />
      <span>{score}/100</span>
      {showLabel && <span className="font-sans font-semibold text-[10px] uppercase tracking-wider text-cockpit-muted ml-0.5">Health</span>}
    </div>
  );
}
