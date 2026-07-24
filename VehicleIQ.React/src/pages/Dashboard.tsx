import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Fuel, Receipt, Bell, TrendingUp, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { vehiclesApi } from '../api/vehicles.api';
import { expensesApi } from '../api/expenses.api';
import { remindersApi } from '../api/reminders.api';
import { fuelEntriesApi } from '../api/fuelEntries.api';
import type { VehicleDto, ExpenseDto, ReminderDto, FuelEntryDto } from '../types';
import { formatCurrency, formatDate, formatKm, expenseCategoryLabel, expenseCategoryColor, daysUntil } from '../utils/formatters';
import { ExpenseCategory, ReminderStatus } from '../types';

export default function Dashboard() {
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
      // fetch fuel for first vehicle
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
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Expense by category pie data
  const categoryTotals = expenses.reduce<Record<number, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryTotals).map(([cat, total]) => ({
    name: expenseCategoryLabel[Number(cat) as ExpenseCategory],
    value: total,
    color: expenseCategoryColor[Number(cat) as ExpenseCategory],
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  // Monthly expense trend (last 6 months)
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card h-32 bg-white/3" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Vehicles"
          value={totalVehicles}
          subtitle="Registered in your garage"
          icon={<Car className="w-5 h-5" />}
          ring="blue"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(monthlyExpenses)}
          subtitle="Total spending"
          icon={<Receipt className="w-5 h-5" />}
          ring="purple"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(totalSpend)}
          subtitle="All time vehicle expenses"
          icon={<TrendingUp className="w-5 h-5" />}
          ring="green"
        />
        <StatCard
          title="Pending Reminders"
          value={pendingReminders.length}
          subtitle={pendingReminders.length > 0 ? 'Need your attention' : 'All clear!'}
          icon={<Bell className="w-5 h-5" />}
          ring="amber"
          trend={pendingReminders.length > 0 ? { value: 'Action needed', positive: false } : undefined}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Spending Trend */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">Spending Trend</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 12,
                  color: '#ffffff',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
                  padding: '10px 14px',
                }}
                cursor={{ stroke: 'rgba(59, 130, 246, 0.4)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                formatter={(v: unknown) => [formatCurrency(v as number), 'Spent']}
              />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Pie */}
        <Card>
          <h3 className="section-title mb-4">Expense Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0d1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                  formatter={(v: unknown) => [formatCurrency(v as number)]}
                />
                <Legend formatter={(v) => <span className="text-slate-400 text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm text-center py-10">No expense data yet</p>
          )}
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Vehicles */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">My Vehicles</h3>
            <Link to="/vehicles" className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {vehicles.length === 0 && <p className="text-slate-500 text-sm">No vehicles yet.</p>}
            {vehicles.slice(0, 3).map(v => (
              <Link to={`/vehicles/${v.id}`} key={v.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 hover:border-white/12 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/30 border border-blue-500/20 flex items-center justify-center">
                  <Car className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{v.make} {v.model} ({v.year})</p>
                  <p className="text-xs text-slate-500">{v.registrationNumber} · {formatKm(v.currentOdometer)}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </Link>
            ))}
          </div>
          <Link to="/vehicles"
            className="flex items-center justify-center gap-2 mt-4 py-2.5 rounded-xl border border-dashed border-white/15 text-slate-500 hover:text-white hover:border-white/30 text-sm transition-all duration-200">
            <Plus className="w-4 h-4" /> Add vehicle
          </Link>
        </Card>

        {/* Upcoming Reminders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Upcoming Reminders</h3>
            <Link to="/reminders" className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {pendingReminders.length === 0 && (
              <p className="text-slate-500 text-sm">All reminders are up to date 🎉</p>
            )}
            {pendingReminders.slice(0, 4).map(r => {
              const days = daysUntil(r.dueDate);
              const isUrgent = days <= 7;
              return (
                <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${isUrgent ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/4 border-white/6'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isUrgent ? 'bg-amber-500/20 text-amber-400' : 'bg-white/8 text-slate-400'}`}>
                    {isUrgent ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{r.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(r.dueDate)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                    ${days < 0 ? 'bg-red-500/15 text-red-400' : isUrgent ? 'bg-amber-500/15 text-amber-400' : 'bg-white/8 text-slate-400'}`}>
                    {days < 0 ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
