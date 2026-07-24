import { useEffect, useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Activity,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { analyticsApi, type FleetSummaryAnalytics } from '../api/analytics.api';
import { formatCurrency, formatDate, formatKm } from '../utils/formatters';

export default function Analytics() {
  const [data, setData] = useState<FleetSummaryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getFleetSummary()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-32 bg-white/3" />
          ))}
        </div>
        <div className="glass-card h-80 bg-white/3" />
      </div>
    );
  }

  if (!data || data.totalVehicles === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="w-8 h-8 text-accent" />}
        title="No Fleet Data Yet"
        description="Add your vehicles, fuel entries, and expenses to unlock AI health insights and service predictions."
      />
    );
  }

  const cpkChartData = data.vehicleSummaries.map((v) => ({
    name: v.vehicleName,
    cpk: v.costPerKm,
    mileage: v.baselineMileageKmL,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner AI Insights Summary */}
      <div className="glass-card p-6 border-l-4 border-l-accent bg-gradient-to-r from-blue-500/10 via-transparent to-transparent relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              VehicleIQ AI Fleet Insights
              <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                Active Monitoring
              </span>
            </h3>
            <div className="space-y-1.5 mt-3">
              {data.keyRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Avg Fleet Mileage"
          value={data.averageFleetMileageKmL > 0 ? `${data.averageFleetMileageKmL.toFixed(1)} km/L` : 'N/A'}
          subtitle="Across registered vehicles"
          icon={<Activity className="w-5 h-5" />}
          ring="blue"
        />
        <StatCard
          title="Cost Per Km (CPK)"
          value={data.averageFleetCostPerKm > 0 ? `₹${data.averageFleetCostPerKm.toFixed(2)} /km` : '₹0 /km'}
          subtitle="Operating efficiency"
          icon={<DollarSign className="w-5 h-5" />}
          ring="purple"
        />
        <StatCard
          title="30-Day Spend Forecast"
          value={formatCurrency(data.forecastNext30DaysSpend)}
          subtitle="Projected run-rate"
          icon={<TrendingUp className="w-5 h-5" />}
          ring="green"
        />
        <StatCard
          title="Active Alerts"
          value={data.activeAnomaliesCount + data.upcomingServicesCount}
          subtitle={`${data.activeAnomaliesCount} fuel anomaly · ${data.upcomingServicesCount} service due`}
          icon={<AlertTriangle className="w-5 h-5" />}
          ring={data.activeAnomaliesCount > 0 ? 'amber' : 'green'}
        />
      </div>

      {/* Charts & Forecast Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cost Per Km (CPK) Chart */}
        <Card className="xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="section-title">Cost Per Kilometer (CPK) Comparison</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total operating expenditure per km driven</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cpkChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />
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
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)', stroke: 'rgba(59, 130, 246, 0.2)', strokeWidth: 1, rx: 6 }}
                formatter={(v: unknown) => [`₹${Number(v).toFixed(2)} / km`, 'Cost Per Km']}
              />
              <Bar dataKey="cpk" radius={[8, 8, 0, 0]}>
                {cpkChartData.map((_, index) => (
                  <Cell key={index} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Expense Forecast Widget */}
        <Card className="flex flex-col justify-between">
          <div>
            <h3 className="section-title mb-1">Expense Forecast</h3>
            <p className="text-xs text-slate-500 mb-6">AI projected fleet maintenance & fuel expenses</p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/4 border border-white/8">
                <p className="text-xs text-slate-400 font-medium">30-Day Forecast</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(data.forecastNext30DaysSpend)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Based on 60-day historical run rate</p>
              </div>

              <div className="p-4 rounded-xl bg-white/4 border border-white/8">
                <p className="text-xs text-slate-400 font-medium">90-Day Forecast</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(data.forecastNext90DaysSpend)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Quarterly fleet budget projection</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/8 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Projections update automatically with every logged expense.</span>
          </div>
        </Card>
      </div>

      {/* Fuel Anomalies & Predictive Service Due */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Fuel Efficiency Anomalies */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Fuel Efficiency Anomalies
            </h3>
            <Badge label={`${data.activeAnomaliesCount} detected`} variant={data.activeAnomaliesCount > 0 ? 'amber' : 'slate'} />
          </div>

          {data.activeAnomaliesCount === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">No Efficiency Anomalies</p>
              <p className="text-xs text-slate-500 mt-1">All fuel entries match rolling baselines.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.vehicleSummaries.flatMap((v) =>
                v.fuelAnomalies.map((a) => (
                  <div
                    key={a.fuelEntryId}
                    className={`p-4 rounded-xl border ${
                      a.severity === 'Critical'
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-amber-500/10 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-white">{v.vehicleName}</p>
                      <Badge
                        label={`${a.percentageDrop}% Drop`}
                        variant={a.severity === 'Critical' ? 'red' : 'amber'}
                        dot
                      />
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{a.recommendation}</p>
                    <div className="flex justify-between text-[11px] text-slate-500 border-t border-white/10 pt-2">
                      <span>Logged: {formatDate(a.date)}</span>
                      <span>Recorded: {a.recordedMileage} km/L (Baseline: {a.baselineMileage} km/L)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </Card>

        {/* Predictive Service Due Calculator */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              Predictive Service Schedule
            </h3>
            <Badge label="AI Estimated" variant="blue" />
          </div>

          <div className="space-y-3">
            {data.vehicleSummaries
              .filter((v) => v.servicePrediction != null)
              .map((v) => {
                const sp = v.servicePrediction!;
                return (
                  <div
                    key={v.vehicleId}
                    className="p-4 rounded-xl bg-white/4 border border-white/8 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-white">{sp.vehicleName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Current: {formatKm(sp.currentOdometer)} · Target: {formatKm(sp.targetServiceOdometer)}
                        </p>
                      </div>
                      <Badge
                        label={sp.urgencyLevel}
                        variant={
                          sp.urgencyLevel === 'Overdue'
                            ? 'red'
                            : sp.urgencyLevel === 'Urgent'
                            ? 'amber'
                            : 'blue'
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/8 pt-2.5 mt-2.5">
                      <div>
                        <span className="text-slate-500">Driving Velocity:</span>{' '}
                        <span className="text-white font-medium">{sp.averageDailyKm} km/day</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500">Estimated Date:</span>{' '}
                        <span className="text-accent font-semibold">
                          {sp.estimatedServiceDate ? formatDate(sp.estimatedServiceDate) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
