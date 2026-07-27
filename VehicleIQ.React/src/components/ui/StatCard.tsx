import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  ring?: 'blue' | 'purple' | 'green' | 'amber';
  trend?: { value: string; positive: boolean };
}

export default function StatCard({ title, value, subtitle, icon, ring = 'amber', trend }: StatCardProps) {
  const borderMap = {
    amber: 'border-cockpit-amber/30 bg-cockpit-amber/5 text-cockpit-amber',
    green: 'border-cockpit-green/30 bg-cockpit-green/5 text-cockpit-green',
    blue: 'border-cockpit-blue/30 bg-cockpit-blue/5 text-cockpit-blue',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
  };

  return (
    <div className="cockpit-card p-5 animate-fade-in border border-cockpit-border">
      <div className="flex items-start justify-between mb-3">
        <p className="text-cockpit-muted text-xs font-semibold uppercase tracking-wider">{title}</p>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${borderMap[ring]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold font-mono text-cockpit-text tracking-tight mb-1">{value}</p>
      {subtitle && <p className="text-xs text-cockpit-muted font-medium">{subtitle}</p>}
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-mono font-semibold ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
