import React from 'react';
import { AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';

interface InsightBannerProps {
  type?: 'warning' | 'info' | 'success' | 'critical';
  title?: string;
  message: string;
  action?: React.ReactNode;
}

export default function InsightBanner({
  type = 'warning',
  title = 'Cockpit Telemetry Diagnostic',
  message,
  action,
}: InsightBannerProps) {
  const stylesMap = {
    warning: {
      border: 'border-l-4 border-l-cockpit-amber bg-amber-500/10 border-amber-500/20 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-cockpit-amber flex-shrink-0 mt-0.5" />,
    },
    critical: {
      border: 'border-l-4 border-l-cockpit-red bg-red-500/10 border-red-500/20 text-red-200',
      icon: <ShieldAlert className="w-5 h-5 text-cockpit-red flex-shrink-0 mt-0.5" />,
    },
    info: {
      border: 'border-l-4 border-l-cockpit-blue bg-blue-500/10 border-blue-500/20 text-blue-200',
      icon: <Info className="w-5 h-5 text-cockpit-blue flex-shrink-0 mt-0.5" />,
    },
    success: {
      border: 'border-l-4 border-l-cockpit-green bg-emerald-500/10 border-emerald-500/20 text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-cockpit-green flex-shrink-0 mt-0.5" />,
    },
  };

  const currentStyle = stylesMap[type];

  return (
    <div className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${currentStyle.border}`}>
      <div className="flex items-start gap-3">
        {currentStyle.icon}
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-cockpit-text">{title}</h4>
          <p className="text-xs font-medium text-cockpit-text/90 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
