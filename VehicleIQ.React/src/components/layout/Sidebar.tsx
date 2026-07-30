import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Sparkles, Car, Fuel, Wrench, Receipt,
  Shield, FileCheck, Bell, FileText, ChevronRight, LogOut, Gauge, Menu, X, Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusDot from '../cockpit/StatusDot';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard Cockpit' },
  { to: '/copilot',     icon: Bot,             label: 'VehicleIQ Copilot', isAi: true },
  { to: '/analytics',   icon: Sparkles,        label: 'Fleet Insights'    },
  { to: '/vehicles',    icon: Car,             label: 'Garage Vehicles'  },
  { to: '/fuel',        icon: Fuel,            label: 'Fuel Telemetry'   },
  { to: '/service',     icon: Wrench,          label: 'Service Logs'     },
  { to: '/expenses',    icon: Receipt,         label: 'Expense Ledger'   },
  { to: '/insurance',   icon: Shield,          label: 'Insurance Policies'},
  { to: '/puc',         icon: FileCheck,       label: 'PUC Testing'      },
  { to: '/reminders',   icon: Bell,            label: 'Reminders Hub'    },
  { to: '/documents',   icon: FileText,        label: 'Document Library' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  const sidebarContent = (
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-cockpit-bg-soft/95 backdrop-blur-xl border-r border-white/10 relative z-20">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 border border-white/20 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]">
            <Gauge className="w-5.5 h-5.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black text-white tracking-tight">VehicleIQ</h1>
              <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-mono font-bold rounded-md">PRO</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 font-medium">Telemetry Cockpit</p>
          </div>
        </div>

        {/* Mobile Drawer Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, isAi }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/10 text-white border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)] font-extrabold'
                  : isAi
                  ? 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r shadow-[0_0_10px_#3B82F6]" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive ? 'text-blue-400' : isAi ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'}`} />
              <span className="flex-1 tracking-wide">{label}</span>
              {isAi && (
                <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-extrabold animate-pulse">AI</span>
              )}
              {isActive && !isAi && <ChevronRight className="w-3.5 h-3.5 text-blue-400" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Driver Profile Footer */}
      <div className="px-4 py-4 border-t border-white/10 space-y-3 bg-cockpit-bg/60">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-cockpit-surface border border-white/10">
          <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 border border-amber-300/40 flex items-center justify-center text-slate-950 text-xs font-black font-mono flex-shrink-0 shadow-sm">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-extrabold text-white truncate">{user?.fullName || 'Driver'}</p>
              <StatusDot status="online" size="sm" />
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">{user?.email || 'driver@vehicleiq.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" /> Stop Engine / Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-40 p-2.5 rounded-xl bg-cockpit-surface border border-white/15 text-blue-400 shadow-xl"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
