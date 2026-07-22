import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  ring?: 'blue' | 'purple' | 'green' | 'amber';
  trend?: { value: string; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, ring = 'blue', trend }: StatCardProps) {
  return (
    <div className={`glass-card p-5 stat-ring-${ring} animate-slide-up`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
          ${ring === 'blue'   ? 'bg-blue-500/15 text-blue-400'   : ''}
          ${ring === 'purple' ? 'bg-purple-500/15 text-purple-400' : ''}
          ${ring === 'green'  ? 'bg-emerald-500/15 text-emerald-400' : ''}
          ${ring === 'amber'  ? 'bg-amber-500/15 text-amber-400'  : ''}
        `}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
