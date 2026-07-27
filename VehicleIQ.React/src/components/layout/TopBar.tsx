import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Plus, Fuel, Receipt, Activity, Clock } from 'lucide-react';
import CockpitButton from '../cockpit/CockpitButton';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':           { title: 'Fleet Cockpit HUD',     subtitle: 'Real-time telemetry, health gauges & predictive analytics' },
  '/analytics':  { title: 'Fleet Insights Engine', subtitle: 'Algorithmic efficiency anomaly detection & spend forecasting' },
  '/vehicles':   { title: 'Garage Telemetry',     subtitle: 'Active fleet vehicles & digital twin specifications'     },
  '/fuel':       { title: 'Fuel Consumption Log', subtitle: 'Rolling mileage (km/L) statistics & fill-up records'    },
  '/service':    { title: 'Maintenance Logs',     subtitle: 'Workshops, periodic service history & next target odometers' },
  '/expenses':   { title: 'Financial Ledger',     subtitle: 'Categorized vehicle expenditure & cost per km benchmarks'   },
  '/insurance':  { title: 'Insurance Vault',      subtitle: 'Policy expiration warnings & premium coverage status'   },
  '/puc':        { title: 'Emission Testing',     subtitle: 'PUC certification dates & BS-VI compliance tracking'      },
  '/reminders':  { title: 'Reminders Kanban',     subtitle: 'Task schedule, overdue warnings & snooze controls'          },
  '/documents':  { title: 'Document Repository',  subtitle: 'RC books, policies & test certificates storage'       },
};

export default function TopBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const basePath = '/' + location.pathname.split('/')[1];
  const page = pageTitles[basePath] ?? pageTitles['/'];

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-cockpit-border bg-cockpit-bg/80 backdrop-blur-md gap-4">
      <div className="animate-fade-in">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-cockpit-text tracking-tight">{page.title}</h2>
          <span className="px-2 py-0.5 rounded bg-cockpit-surface-2 border border-cockpit-border text-[10px] font-mono text-cockpit-amber font-semibold">
            TELEMETRY v2.0
          </span>
        </div>
        <p className="text-xs text-cockpit-muted font-medium mt-0.5">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Cockpit Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cockpit-surface border border-cockpit-border text-cockpit-muted font-mono text-xs">
          <Clock className="w-3.5 h-3.5 text-cockpit-amber" />
          <span className="text-cockpit-text font-bold">{timeStr || '12:00:00'}</span>
          <span className="text-[10px] text-cockpit-muted font-semibold">UTC</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <CockpitButton
            variant="secondary"
            size="sm"
            icon={<Fuel className="w-3.5 h-3.5 text-cockpit-amber" />}
            onClick={() => navigate('/fuel')}
          >
            Log Fuel
          </CockpitButton>

          <CockpitButton
            variant="secondary"
            size="sm"
            icon={<Receipt className="w-3.5 h-3.5 text-cockpit-green" />}
            onClick={() => navigate('/expenses')}
          >
            Add Expense
          </CockpitButton>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => navigate('/reminders')}
            className="w-9 h-9 rounded-xl bg-cockpit-surface hover:bg-cockpit-surface-2 border border-cockpit-border flex items-center justify-center text-cockpit-muted hover:text-cockpit-text transition-all"
            title="View Reminders"
          >
            <Bell className="w-4 h-4 text-cockpit-amber" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-cockpit-amber rounded-full text-[10px] font-mono font-bold text-black flex items-center justify-center shadow-md">
            !
          </span>
        </div>
      </div>
    </header>
  );
}
