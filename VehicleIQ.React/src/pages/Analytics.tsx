import React, { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, Wrench, TrendingUp, Activity, ShieldCheck, DollarSign } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import InsightBanner from '../components/cockpit/InsightBanner';
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="cockpit-card h-32 bg-cockpit-surface-2/40" />
          ))}
        </div>
        <div className="cockpit-card h-80 bg-cockpit-surface-2/40" />
      </div>
    );
  }

  if (!data || data.totalVehicles === 0) {
    return (
      <EmptyState
        icon={<Activity className="w-8 h-8 text-cockpit-amber" />}
        title="No Fleet Telemetry Data"
        description="Add vehicles, log fuel fill-ups, and expenses to activate algorithm insights and predictive diagnostics."
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
      {/* Top Banner Telemetry Diagnostic Strips */}
      <div className="space-y-3">
        {data.keyRecommendations.map((rec, i) => (
          <InsightBanner
            key={i}
            type={rec.includes('⚠️') ? 'warning' : rec.includes('🔧') ? 'info' : 'success'}
            title="Algorithm Diagnostic Notice"
            message={rec}
          />
        ))}
      </div>

      {/* KPI Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricTile
          label="Avg Fleet Mileage"
          value={data.averageFleetMileageKmL > 0 ? `${data.averageFleetMileageKmL.toFixed(1)}` : 'N/A'}
          unit="km/L"
          icon={<Activity className="w-5 h-5" />}
          accentColor="green"
        />
        <MetricTile
          label="Cost Per Km (CPK)"
          value={data.averageFleetCostPerKm > 0 ? `₹${data.averageFleetCostPerKm.toFixed(2)}` : '₹0'}
          unit="/km"
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricTile
          label="30-Day Spend Forecast"
          value={formatCurrency(data.forecastNext30DaysSpend)}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricTile
          label="Active Anomalies"
          value={data.activeAnomaliesCount + data.upcomingServicesCount}
          unit="alerts"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor={data.activeAnomaliesCount > 0 ? 'red' : 'green'}
        />
      </div>

      {/* CPK Chart & Forecast Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cost Per Km Comparison */}
        <CockpitCard className="xl:col-span-2" title="Cost Per Kilometer (CPK) Benchmarks" subtitle="Total operating expenditure per kilometer driven">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={cpkChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
              <XAxis dataKey="name" tick={{ fill: '#71717A', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717A', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1C1C1F',
                  border: '1px solid #2A2A2E',
                  borderRadius: 12,
                  color: '#F4F4F5',
                  fontFamily: 'JetBrains Mono',
                }}
                cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
                formatter={(v: unknown) => [`₹${Number(v).toFixed(2)} / km`, 'Cost Per Km']}
              />
              <Bar dataKey="cpk" radius={[8, 8, 0, 0]}>
                {cpkChartData.map((_, index) => (
                  <Cell key={index} fill={index % 2 === 0 ? '#F59E0B' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CockpitCard>

        {/* Predictive Financial Run-Rate */}
        <CockpitCard title="Financial Spend Projections" subtitle="Algorithmic run-rate forecast">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-cockpit-surface-2/60 border border-cockpit-border">
              <span className="text-[10px] font-mono text-cockpit-muted uppercase block font-semibold">30-Day Budget Projection</span>
              <p className="text-2xl font-bold font-mono text-cockpit-amber mt-1">{formatCurrency(data.forecastNext30DaysSpend)}</p>
              <p className="text-[11px] font-mono text-cockpit-muted mt-1">Based on 60-day historical telemetry run-rate.</p>
            </div>

            <div className="p-4 rounded-xl bg-cockpit-surface-2/60 border border-cockpit-border">
              <span className="text-[10px] font-mono text-cockpit-muted uppercase block font-semibold">90-Day Budget Projection</span>
              <p className="text-2xl font-bold font-mono text-cockpit-green mt-1">{formatCurrency(data.forecastNext90DaysSpend)}</p>
              <p className="text-[11px] font-mono text-cockpit-muted mt-1">Quarterly fleet operational projection.</p>
            </div>
          </div>
        </CockpitCard>
      </div>

      {/* Fuel Anomalies & Predictive Service Due */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Fuel Efficiency Anomalies */}
        <CockpitCard title="Efficiency Drop Alerts (>15%)" subtitle="Fuel consumption deviation warnings">
          {data.activeAnomaliesCount === 0 ? (
            <div className="py-8 text-center text-cockpit-muted font-mono text-xs">
              ✅ All fuel entries match rolling vehicle baselines.
            </div>
          ) : (
            <div className="space-y-3">
              {data.vehicleSummaries.flatMap((v) =>
                v.fuelAnomalies.map((a) => (
                  <div
                    key={a.fuelEntryId}
                    className={`p-4 rounded-xl border font-mono text-xs ${
                      a.severity === 'Critical'
                        ? 'bg-red-500/10 border-red-500/30 text-red-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-cockpit-text">{v.vehicleName}</p>
                      <span className="px-2 py-0.5 rounded font-bold bg-black/40 text-cockpit-amber">
                        {a.percentageDrop}% DROP ({a.severity})
                      </span>
                    </div>
                    <p className="text-xs font-sans text-cockpit-text/90 mb-2">{a.recommendation}</p>
                    <div className="flex justify-between text-[11px] text-cockpit-muted border-t border-cockpit-border/40 pt-2">
                      <span>Logged: {formatDate(a.date)}</span>
                      <span>Recorded: {a.recordedMileage} km/L (Baseline: {a.baselineMileage} km/L)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CockpitCard>

        {/* Service Schedule Forecast */}
        <CockpitCard title="Predictive Service due Calendar" subtitle="Estimated next maintenance dates">
          <div className="space-y-3 font-mono text-xs">
            {data.vehicleSummaries
              .filter((v) => v.servicePrediction != null)
              .map((v) => {
                const sp = v.servicePrediction!;
                return (
                  <div
                    key={v.vehicleId}
                    className="p-3.5 rounded-xl bg-cockpit-surface-2/60 border border-cockpit-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-cockpit-text">{sp.vehicleName}</p>
                        <p className="text-[11px] text-cockpit-muted mt-0.5">
                          Current: {sp.currentOdometer.toLocaleString()} km • Target: {sp.targetServiceOdometer.toLocaleString()} km
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sp.urgencyLevel === 'Overdue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        sp.urgencyLevel === 'Urgent' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {sp.urgencyLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] border-t border-cockpit-border/40 pt-2">
                      <span className="text-cockpit-muted">Daily Velocity: {sp.averageDailyKm} km/day</span>
                      <span className="text-cockpit-amber font-bold">
                        Target Date: {sp.estimatedServiceDate ? formatDate(sp.estimatedServiceDate) : 'N/A'}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </CockpitCard>
      </div>
    </div>
  );
}
