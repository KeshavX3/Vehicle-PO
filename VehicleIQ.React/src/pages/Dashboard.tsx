import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Fuel, Receipt, Bell, TrendingUp, Plus, ChevronRight, Activity, Wrench, ShieldAlert } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import VehicleHero from '../components/cockpit/VehicleHero';
import GaugeRing from '../components/cockpit/GaugeRing';
import TimelineFeed from '../components/cockpit/TimelineFeed';
import type { TimelineItem } from '../components/cockpit/TimelineFeed';
import CockpitButton from '../components/cockpit/CockpitButton';
import InsightBanner from '../components/cockpit/InsightBanner';
import { useTheme } from '../context/ThemeContext';

import { vehiclesApi } from '../api/vehicles.api';
import { expensesApi } from '../api/expenses.api';
import { remindersApi } from '../api/reminders.api';
import { fuelEntriesApi } from '../api/fuelEntries.api';
import type { VehicleDto, ExpenseDto, ReminderDto, FuelEntryDto } from '../types';
import { formatCurrency, formatDate, formatKm, expenseCategoryLabel, expenseCategoryColor, daysUntil } from '../utils/formatters';
import { ExpenseCategory, ReminderStatus } from '../types';
import { calculateHealthScore } from '../utils/healthScore';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [reminders, setReminders] = useState<ReminderDto[]>([]);
  const [fuelEntries, setFuelEntries] = useState<FuelEntryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vehiclesApi.getAll(),
      expensesApi.getAll(),
      remindersApi.getAll(),
    ]).then(([v, e, r]) => {
      setVehicles(v);
      setExpenses(e);
      setReminders(r);
      if (v.length > 0) {
        fuelEntriesApi.getByVehicle(v[0].id).then(setFuelEntries).catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, []);

  // KPIs
  const totalVehicles = vehicles.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingReminders = reminders.filter(r => r.status === ReminderStatus.Pending);
  const urgentReminders = pendingReminders.filter(r => daysUntil(r.dueDate) <= 7);

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Featured Vehicle
  const featuredVehicle = vehicles.length > 0 ? vehicles[0] : null;
  const featuredHealth = featuredVehicle ? calculateHealthScore({
    hasOverdueReminder: pendingReminders.some(r => r.vehicleId === featuredVehicle.id && daysUntil(r.dueDate) < 0),
  }) : 100;

  // Expense category pie data
  const categoryTotals = expenses.reduce<Record<number, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: expenseCategoryLabel[Number(cat) as ExpenseCategory],
    value: total,
    color: expenseCategoryColor[Number(cat) as ExpenseCategory] || '#3B82F6',
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  // Spend trend (last 6 months)
  const trendData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(); const y = d.getFullYear();
    const total = expenses
      .filter(e => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y; })
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      amount: total,
    };
  });

  // Timeline feed conversion: Closest due dates first
  const timelineItems: TimelineItem[] = [...pendingReminders]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)
    .map(r => {
      const days = daysUntil(r.dueDate);
      const isOverdue = days < 0;
      return {
        id: r.id,
        title: r.title,
        subtitle: `${r.description || 'Action required'} • Due: ${formatDate(r.dueDate)}`,
        timestamp: isOverdue ? 'OVERDUE' : days === 0 ? 'TODAY' : `${days}d LEFT`,
        statusColor: isOverdue ? 'red' : days <= 7 ? 'amber' : 'green',
        icon: isOverdue ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <Bell className="w-4 h-4 text-amber-400" />,
      };
    });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="cockpit-card h-28 bg-cockpit-surface-2/40" />
          ))}
        </div>
        <div className="cockpit-card h-72 bg-cockpit-surface-2/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Telemetry Alert Banner ONLY if there are urgent reminders due within 7 days or overdue */}
      {urgentReminders.length > 0 && (
        <InsightBanner
          type="warning"
          title="Urgent Fleet Action Required"
          message={`You have ${urgentReminders.length} urgent task(s) due within 7 days or overdue.`}
          action={
            <CockpitButton size="sm" variant="secondary" onClick={() => navigate('/reminders')}>
              Review Tasks
            </CockpitButton>
          }
        />
      )}

      {/* KPI Metric Tiles Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricTile
          label="Active Fleet Vehicles"
          value={totalVehicles}
          unit="units"
          icon={<Car className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricTile
          label="Current Month Spend"
          value={formatCurrency(monthlyExpenses)}
          icon={<Receipt className="w-5 h-5" />}
          accentColor="azure"
        />
        <MetricTile
          label="Total All-Time Spend"
          value={formatCurrency(totalSpend)}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="green"
        />
        <MetricTile
          label="Pending Reminders"
          value={pendingReminders.length}
          unit="tasks"
          icon={<Bell className="w-5 h-5" />}
          accentColor={urgentReminders.length > 0 ? 'red' : 'green'}
          trend={urgentReminders.length > 0 ? `${urgentReminders.length} Urgent` : 'Optimal'}
          trendUp={urgentReminders.length === 0}
        />
      </div>

      {/* Digital Twin Featured Vehicle Hero Banner */}
      {featuredVehicle ? (
        <VehicleHero vehicle={featuredVehicle} healthScore={featuredHealth} />
      ) : (
        <CockpitCard
          accent="azure"
          title="Welcome to VehicleIQ Telemetry Cockpit"
          subtitle="No vehicles registered yet in your telemetry garage."
        >
          <div className="py-6 text-center">
            <p className="text-sm text-cockpit-muted mb-4">Add your first vehicle to start tracking fuel logs, expenses, and predictive maintenance dates.</p>
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/vehicles')}>
              Add Vehicle to Garage
            </CockpitButton>
          </div>
        </CockpitCard>
      )}

      {/* Charts & Gauges Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 6-Month Expenditure Area Chart */}
        <CockpitCard className="xl:col-span-2" title="Fleet Expenditure Run-Rate" subtitle="6-Month aggregate spending trend">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAzure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#E2E8F0' : 'rgba(255,255,255,0.06)'} />
              <XAxis dataKey="month" tick={{ fill: isLight ? '#64748B' : '#94A3B8', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isLight ? '#64748B' : '#94A3B8', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isLight ? '#FFFFFF' : '#161F33',
                  border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12,
                  color: isLight ? '#0F172A' : '#F8FAFC',
                  fontFamily: 'JetBrains Mono',
                  padding: '10px 14px',
                  boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.5)',
                }}
                cursor={{ stroke: 'rgba(59, 130, 246, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                formatter={(v: unknown) => [formatCurrency(v as number), 'Spend']}
              />
              <Area type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} fill="url(#colorAzure)" />
            </AreaChart>
          </ResponsiveContainer>
        </CockpitCard>

        {/* Expense Category Breakdown Ring */}
        <CockpitCard title="Category Breakdown" subtitle="Expense distribution by module">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke={isLight ? '#FFFFFF' : '#161F33'} strokeWidth={3} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#FFFFFF' : '#161F33',
                    border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 12,
                    color: isLight ? '#0F172A' : '#F8FAFC',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(v: unknown) => [formatCurrency(v as number)]}
                />
                <Legend formatter={(v) => <span className="text-cockpit-muted text-xs font-mono">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center text-cockpit-muted font-mono text-xs">
              No expense transactions logged.
            </div>
          )}
        </CockpitCard>
      </div>

      {/* Telemetry Timeline Feed & Quick Navigation */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CockpitCard
          title="Telemetry Activity Feed"
          subtitle="Upcoming tasks & due notifications"
          action={
            <Link to="/reminders" className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-mono font-semibold">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <TimelineFeed items={timelineItems} />
        </CockpitCard>

        {/* Fleet Garage Quick List */}
        <CockpitCard
          title="Garage Vehicles Overview"
          subtitle="Registered telemetry units"
          action={
            <Link to="/vehicles" className="text-xs text-blue-500 hover:underline flex items-center gap-1 font-mono font-semibold">
              Garage Grid <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="space-y-3">
            {vehicles.slice(0, 3).map((v) => (
              <Link
                key={v.id}
                to={`/vehicles/${v.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-cockpit-surface-2/80 hover:bg-cockpit-surface border border-cockpit-border hover:border-blue-500/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-cockpit-text group-hover:text-blue-500 transition-colors">
                      {v.make} {v.model} ({v.year})
                    </h4>
                    <p className="text-xs font-mono text-cockpit-muted mt-0.5">
                      {v.registrationNumber} • {v.currentOdometer.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cockpit-muted group-hover:text-blue-500 transition-colors" />
              </Link>
            ))}

            <CockpitButton
              variant="secondary"
              className="w-full justify-center !py-2.5 text-xs font-semibold"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/vehicles')}
            >
              Add New Vehicle to Garage
            </CockpitButton>
          </div>
        </CockpitCard>
      </div>
    </div>
  );
}
