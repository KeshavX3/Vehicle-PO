import React from 'react';

interface CockpitCardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  accent?: 'amber' | 'green' | 'red' | 'blue' | 'none';
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
    amber: 'border-l-4 border-l-cockpit-amber',
    green: 'border-l-4 border-l-cockpit-green',
    red: 'border-l-4 border-l-cockpit-red',
    blue: 'border-l-4 border-l-cockpit-blue',
    none: '',
  };

  return (
    <div className={`cockpit-card p-5 ${accentBorderMap[accent]} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-cockpit-border/60">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-cockpit-text tracking-tight flex items-center gap-2">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-cockpit-muted font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
