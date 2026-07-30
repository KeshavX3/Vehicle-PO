import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Plus, Fuel, Receipt, Activity, Clock, ShieldCheck } from 'lucide-react';
import CockpitButton from '../cockpit/CockpitButton';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':           { title: 'Fleet Cockpit HUD',     subtitle: 'Real-time telemetry, health gauges & predictive analytics' },
  '/copilot':    { title: 'VehicleIQ Copilot AI',  subtitle: 'Intelligent multi-turn AI fleet advisor & operational control' },
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
    <header className="flex flex-col md:flex-row md:items-center justify-between pl-14 pr-4 md:px-6 py-3.5 md:py-4 border-b border-white/10 bg-cockpit-bg/90 backdrop-blur-xl gap-3.5 relative z-10">
      <div className="animate-fade-in">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-extrabold text-white tracking-tight">{page.title}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-[10px] font-mono font-extrabold text-blue-400">
            APEX TELEMETRY v2.5
          </span>
        </div>
        <p className="text-xs text-slate-400 font-medium mt-0.5">{page.subtitle}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Cockpit Digital Clock */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-cockpit-surface border border-white/10 text-slate-400 font-mono text-xs shadow-inner">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-white font-bold tracking-wider">{timeStr || '12:00:00'}</span>
          <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">LIVE</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <CockpitButton
            variant="secondary"
            size="sm"
            icon={<Fuel className="w-3.5 h-3.5 text-amber-400" />}
            onClick={() => navigate('/fuel')}
          >
            Log Fuel
          </CockpitButton>

          <CockpitButton
            variant="secondary"
            size="sm"
            icon={<Receipt className="w-3.5 h-3.5 text-emerald-400" />}
            onClick={() => navigate('/expenses')}
          >
            Add Expense
          </CockpitButton>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => navigate('/reminders')}
            className="w-9.5 h-9.5 rounded-xl bg-cockpit-surface hover:bg-cockpit-surface-2 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md"
            title="View Reminders"
          >
            <Bell className="w-4 h-4 text-amber-400" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full text-[9px] font-mono font-extrabold text-black flex items-center justify-center shadow-md">
            !
          </span>
        </div>
      </div>
    </header>
  );
}
