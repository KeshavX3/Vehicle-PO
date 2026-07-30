import React from 'react';

interface CockpitCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  accent?: 'amber' | 'green' | 'red' | 'blue' | 'azure' | 'cyan' | 'none';
  className?: string;
}

export default function CockpitCard({
  children,
  title,
  subtitle,
  action,
  accent = 'none',
  className = '',
}: CockpitCardProps) {
  const accentBorderMap = {
    amber: 'border-l-4 border-l-amber-500 shadow-[inset_1px_0_15px_rgba(245,158,11,0.08)]',
    green: 'border-l-4 border-l-emerald-500 shadow-[inset_1px_0_15px_rgba(16,185,129,0.08)]',
    red: 'border-l-4 border-l-red-500 shadow-[inset_1px_0_15px_rgba(239,68,68,0.08)]',
    blue: 'border-l-4 border-l-blue-500 shadow-[inset_1px_0_15px_rgba(59,130,246,0.08)]',
    azure: 'border-l-4 border-l-blue-500 shadow-[inset_1px_0_15px_rgba(59,130,246,0.08)]',
    cyan: 'border-l-4 border-l-cyan-500 shadow-[inset_1px_0_15px_rgba(6,182,212,0.08)]',
    none: '',
  };

  return (
    <div className={`cockpit-card p-5 ${accentBorderMap[accent]} ${className}`}>
      {/* Top subtle glow bar */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
