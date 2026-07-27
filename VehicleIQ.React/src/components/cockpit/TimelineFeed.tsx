import React from 'react';

export interface TimelineItem {
  id: string | number;
  title: string;
  subtitle?: string;
  timestamp: string;
  icon?: React.ReactNode;
  statusColor?: 'green' | 'amber' | 'red' | 'blue';
  action?: React.ReactNode;
}

interface TimelineFeedProps {
  items: TimelineItem[];
  emptyMessage?: string;
}

export default function TimelineFeed({ items, emptyMessage = 'No recent activity telemetry logged.' }: TimelineFeedProps) {
  if (items.length === 0) {
    return <p className="text-xs text-cockpit-muted font-mono p-4 text-center">{emptyMessage}</p>;
  }

  const dotColorMap = {
    green: 'bg-cockpit-green shadow-cockpit-green/50',
    amber: 'bg-cockpit-amber shadow-cockpit-amber/50',
    red: 'bg-cockpit-red shadow-cockpit-red/50',
    blue: 'bg-cockpit-blue shadow-cockpit-blue/50',
  };

  return (
    <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-cockpit-border">
      {items.map((item) => (
        <div key={item.id} className="relative flex items-start gap-3.5 group">
          {/* Dot */}
          <div className={`absolute -left-4 top-1 w-3 h-3 rounded-full border-2 border-cockpit-bg shadow-sm ${dotColorMap[item.statusColor || 'amber']}`} />

          <div className="flex-1 bg-cockpit-bg-soft/50 border border-cockpit-border/40 p-3 rounded-lg flex items-center justify-between gap-3 hover:border-cockpit-border transition-all">
            <div className="flex items-center gap-3">
              {item.icon && <div className="text-cockpit-amber flex-shrink-0">{item.icon}</div>}
              <div>
                <h4 className="text-xs font-bold text-cockpit-text">{item.title}</h4>
                {item.subtitle && <p className="text-[11px] text-cockpit-muted font-medium mt-0.5">{item.subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-cockpit-muted font-medium whitespace-nowrap">{item.timestamp}</span>
              {item.action}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
