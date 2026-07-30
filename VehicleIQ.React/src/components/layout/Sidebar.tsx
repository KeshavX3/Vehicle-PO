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
    <aside className="w-64 flex-shrink-0 flex flex-col h-full bg-cockpit-bg-soft border-r border-cockpit-border">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-cockpit-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cockpit-amber/15 border border-cockpit-amber/30 flex items-center justify-center text-cockpit-amber shadow-lg shadow-cockpit-amber/10">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-cockpit-text tracking-tight">VehicleIQ</h1>
              <span className="px-1.5 py-0.2 bg-cockpit-amber/20 text-cockpit-amber border border-cockpit-amber/30 text-[9px] font-mono font-bold rounded">HUD</span>
            </div>
            <p className="text-[11px] font-mono text-cockpit-muted">Automotive Cockpit</p>
          </div>
        </div>

        {/* Mobile Drawer Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 text-cockpit-muted hover:text-cockpit-text"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, isAi }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isActive
                  ? 'bg-cockpit-amber/10 text-cockpit-amber border border-cockpit-amber/30 shadow-md shadow-cockpit-amber/5 font-bold'
                  : isAi
                  ? 'text-cockpit-amber/90 hover:text-cockpit-amber hover:bg-cockpit-amber/10 border border-cockpit-amber/20'
                  : 'text-cockpit-muted hover:text-cockpit-text hover:bg-cockpit-surface-2'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-cockpit-amber rounded-r" />
              )}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${isActive || isAi ? 'text-cockpit-amber' : 'text-cockpit-muted group-hover:text-cockpit-text'}`} />
              <span className="flex-1 tracking-wide">{label}</span>
              {isAi && (
                <span className="px-1.5 py-0.5 rounded bg-cockpit-amber/20 text-cockpit-amber border border-cockpit-amber/30 text-[9px] font-mono font-extrabold">AI</span>
              )}
              {isActive && !isAi && <ChevronRight className="w-3.5 h-3.5 text-cockpit-amber" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="px-4 py-4 border-t border-cockpit-border space-y-3 bg-cockpit-bg">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cockpit-surface-2 border border-cockpit-border">
          <div className="w-8 h-8 rounded-lg bg-cockpit-amber/20 border border-cockpit-amber/40 flex items-center justify-center text-cockpit-amber text-xs font-bold font-mono flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-bold text-cockpit-text truncate">{user?.fullName || 'Driver'}</p>
              <StatusDot status="online" size="sm" />
            </div>
            <p className="text-[10px] font-mono text-cockpit-muted truncate">{user?.email || 'driver@vehicleiq.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-cockpit-red hover:bg-cockpit-red/10 border border-cockpit-red/25 transition-all duration-200"
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
          className="fixed top-3 left-3 z-40 p-2 rounded-xl bg-cockpit-surface border border-cockpit-border text-cockpit-amber shadow-lg"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
