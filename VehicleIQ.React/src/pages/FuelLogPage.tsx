import { useEffect, useState } from 'react';
import { Fuel, Plus, Trash2, Gauge, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { fuelEntriesApi } from '../api/fuelEntries.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { FuelEntryDto, VehicleDto, CreateFuelEntryRequest } from '../types';
import { FuelType } from '../types';
import { formatCurrency, formatDate, formatKm, fuelTypeLabel } from '../utils/formatters';

import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

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
      toast.success('Fuel entry deleted permanently from database');
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
        <div className="flex items-center gap-3">
          <div className="form-group min-w-[220px]">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-navy-800 border-white/10 text-white rounded-xl text-sm"
            >
              <option value="all"> All Vehicles ({vehicles.length})</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Log Fuel Refill
        </button>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Fuel Refills"
          value={filtered.length.toString()}
          subtitle={`${totalLiters.toFixed(1)} Liters consumed`}
          icon={<Fuel className="w-5 h-5" />}
          ring="blue"
        />
        <StatCard
          title="Total Fuel Spend"
          value={formatCurrency(totalCost)}
          subtitle="Cumulative refuel expenditure"
          icon={<Fuel className="w-5 h-5" />}
          ring="purple"
        />
        <StatCard
          title="Average Rolling Mileage"
          value={avgMileage > 0 ? `${avgMileage.toFixed(1)} km/L` : 'N/A'}
          subtitle="Full-tank-to-full-tank math"
          icon={<Gauge className="w-5 h-5" />}
          ring="green"
        />
      </div>

      {/* Fuel Entries Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Fuel className="w-8 h-8 text-accent" />}
          title="No fuel entries found"
          description="Log your fuel fill-ups to calculate live rolling mileage and detect efficiency anomalies."
          action={
            <button onClick={() => setOpen(true)} className="btn-primary">
              Log First Refill
            </button>
          }
        />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vehicle</th>
                <th>Station</th>
                <th>Odometer</th>
                <th>Quantity</th>
                <th>Price / L</th>
                <th className="text-right">Total Cost</th>
                <th>Mileage</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const vehicle = vehicles.find((v) => v.id === e.vehicleId);
                return (
                  <tr key={e.id} className="group hover:bg-white/4 transition-colors">
                    <td>{formatDate(e.date)}</td>
                    <td>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : '—'}
                        </p>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {vehicle?.registrationNumber || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="text-slate-300 text-sm">{e.fuelStationName || '—'}</td>
                    <td className="text-slate-300 font-medium">{formatKm(e.odometerReading)}</td>
                    <td className="text-slate-300">{e.quantity.toFixed(1)} L</td>
                    <td className="text-slate-400">₹{e.pricePerLiter.toFixed(2)}</td>
                    <td className="text-right font-bold text-white">{formatCurrency(e.totalCost)}</td>
                    <td>
                      {e.calculatedMileage && e.calculatedMileage > 0 ? (
                        <Badge label={`${e.calculatedMileage.toFixed(1)} km/L`} variant="green" />
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => setDeleteId(e.id)}
                        className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1"
                        title="Delete fuel entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Add Fuel Entry Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Log Fuel Fill-up">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Select Vehicle *</label>
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
              <input {...register('fuelStationName')} placeholder="e.g. BPCL Outlet" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input type="checkbox" id="isFullTank" {...register('isFullTank')} defaultChecked className="rounded bg-navy-800" />
            <label htmlFor="isFullTank" className="text-sm text-slate-300 font-normal cursor-pointer">
              Full tank refuel (Required for auto km/L calculation)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              Save Refill
            </button>
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
        description="Are you sure you want to permanently delete this fuel entry and its auto-generated expense record from the database?"
      />
    </div>
  );
}
