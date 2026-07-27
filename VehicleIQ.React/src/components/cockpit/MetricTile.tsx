import React from 'react';

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  accentColor?: 'amber' | 'green' | 'red' | 'blue';
}

export default function MetricTile({
  icon,
  label,
  value,
  unit,
  trend,
  trendUp,
  accentColor = 'amber',
}: MetricTileProps) {
  const colorMap = {
    amber: 'text-cockpit-amber border-cockpit-amber/20 bg-cockpit-amber/10',
    green: 'text-cockpit-green border-cockpit-green/20 bg-cockpit-green/10',
    red: 'text-cockpit-red border-cockpit-red/20 bg-cockpit-red/10',
    blue: 'text-cockpit-blue border-cockpit-blue/20 bg-cockpit-blue/10',
  };

  return (
    <div className="cockpit-card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className={`p-3 rounded-xl border ${colorMap[accentColor]} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cockpit-muted">{label}</p>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono text-2xl font-bold text-cockpit-text tracking-tight">{value}</span>
            {unit && <span className="text-xs text-cockpit-muted font-medium">{unit}</span>}
          </div>
        </div>
      </div>

      {trend && (
        <span className={`text-xs font-mono font-medium px-2 py-1 rounded-md border ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {trend}
        </span>
      )}
    </div>
  );
}
