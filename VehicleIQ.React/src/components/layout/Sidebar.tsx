import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, Fuel, Wrench, Receipt,
  Shield, FileCheck, Bell, FileText, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/vehicles',    icon: Car,             label: 'Vehicles'      },
  { to: '/fuel',        icon: Fuel,            label: 'Fuel Log'      },
  { to: '/service',     icon: Wrench,          label: 'Service'       },
  { to: '/expenses',    icon: Receipt,         label: 'Expenses'      },
  { to: '/insurance',   icon: Shield,          label: 'Insurance'     },
  { to: '/puc',         icon: FileCheck,       label: 'PUC'           },
  { to: '/reminders',   icon: Bell,            label: 'Reminders'     },
  { to: '/documents',   icon: FileText,        label: 'Documents'     },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full glass-card rounded-none border-r border-white/8 border-t-0 border-b-0 border-l-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">VehicleIQ</h1>
          <p className="text-xs text-slate-500">Smart Fleet Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-accent/15 text-accent border border-accent/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/6'
                }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3 h-3 text-accent/60" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="px-4 py-4 border-t border-white/8 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email || 'Logged in'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
