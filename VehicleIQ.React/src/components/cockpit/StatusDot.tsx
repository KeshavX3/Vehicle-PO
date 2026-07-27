import React from 'react';

interface StatusDotProps {
  status?: 'healthy' | 'warning' | 'critical' | 'online';
  label?: string;
  size?: 'sm' | 'md';
}

export default function StatusDot({ status = 'online', label, size = 'md' }: StatusDotProps) {
  const colorMap = {
    healthy: 'bg-emerald-500 shadow-emerald-500/50',
    online: 'bg-emerald-500 shadow-emerald-500/50',
    warning: 'bg-amber-500 shadow-amber-500/50',
    critical: 'bg-red-500 shadow-red-500/50',
  };

  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className="relative flex">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorMap[status]}`} />
        <span className={`relative inline-flex rounded-full shadow-sm ${sizeMap[size]} ${colorMap[status]}`} />
      </span>
      {label && <span className="text-xs font-semibold text-cockpit-muted">{label}</span>}
    </div>
  );
}
