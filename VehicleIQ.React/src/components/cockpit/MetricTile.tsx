import React from 'react';

interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  accentColor?: 'amber' | 'green' | 'red' | 'blue' | 'azure' | 'cyan';
}

export default function MetricTile({
  icon,
  label,
  value,
  unit,
  trend,
  trendUp,
  accentColor = 'azure',
}: MetricTileProps) {
  const colorMap = {
    amber: 'text-amber-400 border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    green: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    red: 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    blue: 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    azure: 'text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
  };

  return (
    <div className="cockpit-card-hover p-4 flex items-center justify-between gap-4 group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl border ${colorMap[accentColor]} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono text-2xl font-extrabold text-white tracking-tight group-hover:text-blue-400 transition-colors">{value}</span>
            {unit && <span className="text-xs text-slate-400 font-mono font-medium">{unit}</span>}
          </div>
        </div>
      </div>

      {trend && (
        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
  );
}
