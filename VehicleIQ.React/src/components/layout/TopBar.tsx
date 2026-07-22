import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/':           { title: 'Dashboard',      subtitle: 'Your fleet overview at a glance'     },
  '/vehicles':   { title: 'My Vehicles',    subtitle: 'Manage your registered vehicles'     },
  '/fuel':       { title: 'Fuel Log',       subtitle: 'Track fuel consumption & mileage'    },
  '/service':    { title: 'Service History',subtitle: 'Maintenance & repair records'        },
  '/expenses':   { title: 'Expenses',       subtitle: 'All your vehicle-related spending'   },
  '/insurance':  { title: 'Insurance',      subtitle: 'Policy details & renewal tracking'   },
  '/puc':        { title: 'PUC Certificates',subtitle: 'Emission test records'              },
  '/reminders':  { title: 'Reminders',      subtitle: 'Upcoming tasks & due dates'          },
  '/documents':  { title: 'Documents',      subtitle: 'Your vehicle document library'       },
};

export default function TopBar() {
  const location = useLocation();

  // match dynamic routes like /vehicles/:id
  const basePath = '/' + location.pathname.split('/')[1];
  const page = pageTitles[basePath] ?? pageTitles['/'];

  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-white/8">
      <div className="animate-fade-in">
        <h2 className="text-xl font-bold text-white">{page.title}</h2>
        <p className="text-sm text-slate-400 mt-0.5">{page.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-200">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    </header>
  );
}
