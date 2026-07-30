import React, { useEffect, useState } from 'react';
import { Fuel, Plus, Trash2, Gauge } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import GaugeRing from '../components/cockpit/GaugeRing';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

import { fuelEntriesApi } from '../api/fuelEntries.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { FuelEntryDto, VehicleDto, CreateFuelEntryRequest } from '../types';
import { FuelType } from '../types';
import { formatCurrency, formatDate, formatKm, fuelTypeLabel } from '../utils/formatters';

export default function FuelLogPage() {
  const [entries, setEntries] = useState<FuelEntryDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateFuelEntryRequest>();

  const loadData = () => {
    Promise.all([fuelEntriesApi.getAll(), vehiclesApi.getAll()])
      .then(([f, v]) => {
        setEntries(f);
        setVehicles(v);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: CreateFuelEntryRequest) => {
    await fuelEntriesApi.create({
      ...data,
      vehicleId: Number(data.vehicleId),
      quantity: Number(data.quantity),
      pricePerLiter: Number(data.pricePerLiter),
      odometerReading: Number(data.odometerReading),
      fuelType: Number(data.fuelType),
      isFullTank: Boolean(data.isFullTank),
    });
    toast.success('Fuel entry logged!');
    reset();
    setOpen(false);
    loadData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await fuelEntriesApi.delete(deleteId);
      toast.success('Fuel entry deleted successfully');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete fuel entry');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = selectedVehicleId === 'all'
    ? entries
    : entries.filter((e) => e.vehicleId === selectedVehicleId);

  const totalCost = filtered.reduce((s, e) => s + e.totalCost, 0);
  const totalLiters = filtered.reduce((s, e) => s + e.quantity, 0);
  const validMileages = filtered.filter((e) => e.calculatedMileage && e.calculatedMileage > 0);
  const avgMileage = validMileages.length > 0
    ? validMileages.reduce((s, e) => s + (e.calculatedMileage || 0), 0) / validMileages.length
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="form-group min-w-[240px]">
          <label>Filter Telemetry by Vehicle</label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-cockpit-surface-2 border-cockpit-border text-cockpit-text rounded-xl"
          >
            <option value="all">All Fleet Units ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>

        <CockpitButton
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setOpen(true)}
        >
          Log Fuel Refill
        </CockpitButton>
      </div>

      {/* KPI Stat Cards & Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricTile
          label="Total Fuel Refills"
          value={filtered.length}
          unit="entries"
          icon={<Fuel className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricTile
          label="Total Volume Consumed"
          value={totalLiters.toFixed(1)}
          unit="L"
          icon={<Fuel className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricTile
          label="Cumulative Refuel Cost"
          value={formatCurrency(totalCost)}
          icon={<Fuel className="w-5 h-5" />}
          accentColor="green"
        />

        {/* Rolling Mileage SVG Gauge Card */}
        <CockpitCard className="flex flex-col items-center justify-center p-4 text-center">
          <GaugeRing
            value={avgMileage}
            max={30}
            label="Rolling Mileage"
            unit="km/L"
            color="green"
            size="sm"
          />
        </CockpitCard>
      </div>

      {/* Fuel Entries Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Fuel className="w-8 h-8 text-cockpit-amber" />}
          title="No fuel entries logged"
          description="Log fuel fill-ups to compute live rolling mileage and flag efficiency anomalies."
          action={
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
              Log First Refill
            </CockpitButton>
          }
        />
      ) : (
        <CockpitCard className="!p-0 overflow-hidden" title="Fuel Refuel Telemetry History" subtitle="Full-tank-to-full-tank calculation logs">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle Unit</th>
                  <th>Station</th>
                  <th>Odometer</th>
                  <th>Quantity</th>
                  <th>Price / L</th>
                  <th className="text-right">Total Cost</th>
                  <th>Calculated Mileage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const vehicle = vehicles.find((v) => v.id === e.vehicleId);
                  return (
                    <tr key={e.id} className="group">
                      <td className="font-mono text-xs">{formatDate(e.date)}</td>
                      <td>
                        <div>
                          <p className="font-bold text-cockpit-text text-xs">
                            {vehicle ? `${vehicle.make} ${vehicle.model}` : '—'}
                          </p>
                          <span className="text-[10px] text-cockpit-muted font-mono">
                            {vehicle?.registrationNumber || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="text-cockpit-muted text-xs">{e.fuelStationName || 'BPCL Outlet'}</td>
                      <td className="font-mono font-semibold text-cockpit-text">{e.odometerReading.toLocaleString()} km</td>
                      <td className="font-mono font-bold text-cockpit-text">{e.quantity.toFixed(1)} L</td>
                      <td className="font-mono text-cockpit-muted">₹{e.pricePerLiter.toFixed(2)}</td>
                      <td className="text-right font-mono font-bold text-amber-400">{formatCurrency(e.totalCost)}</td>
                      <td className="font-mono font-bold text-emerald-400">
                        {e.calculatedMileage && e.calculatedMileage > 0 ? `${e.calculatedMileage.toFixed(1)} km/L` : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => setDeleteId(e.id)}
                          className="btn-cockpit-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1 text-xs"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CockpitCard>
      )}

      {/* Add Fuel Entry Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Log Fuel Refill">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Select Vehicle Unit *</label>
            <select {...register('vehicleId', { required: true })}>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Refill Date *</label>
              <input type="date" {...register('date', { required: true })} />
            </div>
            <div className="form-group">
              <label>Odometer Reading (km) *</label>
              <input type="number" step="0.1" {...register('odometerReading', { required: true })} />
            </div>
            <div className="form-group">
              <label>Quantity (Liters) *</label>
              <input type="number" step="0.01" {...register('quantity', { required: true })} />
            </div>
            <div className="form-group">
              <label>Price Per Liter (₹) *</label>
              <input type="number" step="0.01" {...register('pricePerLiter', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Fuel Type *</label>
              <select {...register('fuelType', { required: true })}>
                {Object.entries(FuelType)
                  .filter(([, v]) => typeof v === 'number')
                  .map(([k, v]) => (
                    <option key={v as number} value={v as number}>
                      {fuelTypeLabel[v as FuelType]}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Station Name</label>
              <input {...register('fuelStationName')} placeholder="e.g. BPCL Mega Outlet" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isFullTank" {...register('isFullTank')} defaultChecked className="rounded bg-cockpit-surface-2 accent-cockpit-amber" />
            <label htmlFor="isFullTank" className="text-xs text-cockpit-muted font-normal cursor-pointer">
              Full tank refuel (Required for rolling km/L calculation)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpen(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Refill Entry
            </CockpitButton>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Delete Fuel Entry"
        description="Are you sure you want to delete this fuel entry?"
      />
    </div>
  );
}
