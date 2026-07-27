import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Trash2, ChevronRight, Gauge, Grid, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import RegistrationPlate from '../components/cockpit/RegistrationPlate';
import HealthScoreBadge from '../components/cockpit/HealthScoreBadge';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

import type { VehicleDto, CreateVehicleRequest } from '../types';
import { VehicleType, FuelType } from '../types';
import { vehiclesApi } from '../api/vehicles.api';
import { formatKm, vehicleTypeLabel, fuelTypeLabel } from '../utils/formatters';
import { calculateHealthScore } from '../utils/healthScore';

const fuelTypeColors: Record<FuelType, string> = {
  [FuelType.Petrol]: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  [FuelType.Diesel]: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  [FuelType.CNG]: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  [FuelType.Electric]: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  [FuelType.Hybrid]: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
};

const defaultVehicleImages: Record<number, string> = {
  [VehicleType.Car]: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  [VehicleType.Bike]: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
  [VehicleType.Scooter]: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  [VehicleType.Truck]: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
  [VehicleType.SUV]: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateVehicleRequest>();

  const load = () => vehiclesApi.getAll().then(setVehicles).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: CreateVehicleRequest) => {
    await vehiclesApi.create({
      ...data,
      year: Number(data.year),
      currentOdometer: Number(data.currentOdometer),
      vehicleType: Number(data.vehicleType),
      fuelType: Number(data.fuelType)
    });
    toast.success('Vehicle added to telemetry garage!');
    reset();
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await vehiclesApi.delete(deleteId);
      toast.success('Vehicle deleted successfully');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-cockpit-text">Telemetry Garage</h2>
          <p className="text-xs font-mono text-cockpit-muted mt-0.5">{vehicles.length} vehicle units registered in database</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl bg-cockpit-surface-2 border border-cockpit-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-cockpit-amber text-black' : 'text-cockpit-muted hover:text-cockpit-text'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-cockpit-amber text-black' : 'text-cockpit-muted hover:text-cockpit-text'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <CockpitButton
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setOpen(true)}
          >
            Add Vehicle
          </CockpitButton>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="cockpit-card h-72 bg-cockpit-surface-2/40" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="w-8 h-8 text-cockpit-amber" />}
          title="No vehicles in garage"
          description="Add your first vehicle unit to start tracking fuel, maintenance, and AI insights."
          action={
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
              Add Your First Vehicle
            </CockpitButton>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Garage Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vehicles.map((v) => {
            const vehicleImage = v.photoUrl || defaultVehicleImages[v.vehicleType] || defaultVehicleImages[VehicleType.Car];
            const health = calculateHealthScore({});

            return (
              <div
                key={v.id}
                className="cockpit-card-hover group flex flex-col justify-between overflow-hidden border-cockpit-border hover:border-cockpit-amber/40"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-cockpit-bg-soft">
                  <img
                    src={vehicleImage}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultVehicleImages[v.vehicleType] || defaultVehicleImages[VehicleType.Car];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1F] via-[#1C1C1F]/40 to-transparent" />

                  {/* Top Bar Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <RegistrationPlate registrationNumber={v.registrationNumber} size="sm" />
                    <div className="flex items-center gap-2">
                      <HealthScoreBadge score={health} size="sm" showLabel={false} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteId(v.id); }}
                        className="btn-cockpit-danger !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Name Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-cockpit-amber block">
                      {vehicleTypeLabel[v.vehicleType]} • {v.year} Model
                    </span>
                    <h3 className="text-xl font-extrabold text-cockpit-text tracking-tight group-hover:text-cockpit-amber transition-colors">
                      {v.make} {v.model}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-2 flex-wrap text-xs font-mono font-semibold">
                    <span className={`px-2.5 py-1 rounded-lg border ${fuelTypeColors[v.fuelType]}`}>
                      {fuelTypeLabel[v.fuelType]}
                    </span>
                    {v.color && (
                      <span className="px-2.5 py-1 rounded-lg border border-cockpit-border bg-cockpit-surface-2 text-cockpit-muted">
                        {v.color}
                      </span>
                    )}
                  </div>

                  {/* Footer Row: Odometer & Details Link */}
                  <div className="flex items-center justify-between pt-3 border-t border-cockpit-border/60">
                    <div className="flex items-center gap-2 text-cockpit-text">
                      <Gauge className="w-4 h-4 text-cockpit-amber flex-shrink-0" />
                      <span className="text-sm font-mono font-bold">{v.currentOdometer.toLocaleString()} km</span>
                    </div>

                    <Link
                      to={`/vehicles/${v.id}`}
                      className="text-xs font-mono font-bold text-cockpit-amber hover:underline flex items-center gap-1"
                    >
                      Digital Twin <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <CockpitCard className="!p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Vehicle Unit</th>
                <th>Type</th>
                <th>Fuel</th>
                <th>Odometer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>
                    <RegistrationPlate registrationNumber={v.registrationNumber} size="sm" />
                  </td>
                  <td className="font-bold text-cockpit-text">
                    {v.make} {v.model} ({v.year})
                  </td>
                  <td>{vehicleTypeLabel[v.vehicleType]}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${fuelTypeColors[v.fuelType]}`}>
                      {fuelTypeLabel[v.fuelType]}
                    </span>
                  </td>
                  <td className="font-mono font-bold text-cockpit-text">{v.currentOdometer.toLocaleString()} km</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link to={`/vehicles/${v.id}`} className="text-xs font-mono font-semibold text-cockpit-amber hover:underline">
                        Telemetry
                      </Link>
                      <button onClick={() => setDeleteId(v.id)} className="text-cockpit-red hover:underline text-xs font-mono">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CockpitCard>
      )}

      {/* Add Vehicle Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add New Vehicle Unit" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Make *</label>
              <input {...register('make', { required: true })} placeholder="e.g. Toyota, Honda, BMW" />
            </div>
            <div className="form-group">
              <label>Model *</label>
              <input {...register('model', { required: true })} placeholder="e.g. Fortuner, City, M4" />
            </div>
            <div className="form-group">
              <label>Year *</label>
              <input type="number" {...register('year', { required: true })} placeholder="2023" min={1990} max={2030} />
            </div>
            <div className="form-group">
              <label>Registration No. *</label>
              <input {...register('registrationNumber', { required: true })} placeholder="MH 12 AB 1234" />
            </div>
            <div className="form-group">
              <label>Vehicle Type *</label>
              <select {...register('vehicleType', { required: true })}>
                {Object.entries(VehicleType).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{k}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Fuel Type *</label>
              <select {...register('fuelType', { required: true })}>
                {Object.entries(FuelType).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{k}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <input {...register('color')} placeholder="Pearl White, Napoli Black…" />
            </div>
            <div className="form-group">
              <label>Current Odometer (km) *</label>
              <input type="number" {...register('currentOdometer', { required: true })} placeholder="25000" min={0} />
            </div>
          </div>

          <div className="form-group">
            <label>Vehicle Photo URL (Optional)</label>
            <input {...register('photoUrl')} placeholder="https://images.unsplash.com/photo-..." />
            <p className="text-[11px] text-cockpit-muted mt-1 font-mono">Leave empty to use high-quality vehicle type presets.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpen(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Vehicle Unit
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
        title="Delete Vehicle Unit"
        description="Are you sure you want to delete this vehicle?"
      />
    </div>
  );
}
