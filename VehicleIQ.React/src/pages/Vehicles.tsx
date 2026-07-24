import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Plus, Trash2, ChevronRight, Gauge } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import type { VehicleDto, CreateVehicleRequest } from '../types';
import { VehicleType, FuelType } from '../types';
import { vehiclesApi } from '../api/vehicles.api';
import { formatKm, vehicleTypeLabel, fuelTypeLabel } from '../utils/formatters';

import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

const fuelTypeColors: Record<FuelType, 'blue' | 'amber' | 'green' | 'purple' | 'slate'> = {
  [FuelType.Petrol]: 'blue',
  [FuelType.Diesel]: 'amber',
  [FuelType.CNG]: 'green',
  [FuelType.Electric]: 'purple',
  [FuelType.Hybrid]: 'slate',
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
    toast.success('Vehicle added to garage!');
    reset();
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await vehiclesApi.delete(deleteId);
      toast.success('Vehicle deleted permanently from database');
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
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in your garage</p>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-72 animate-pulse bg-white/3" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="w-8 h-8" />}
          title="No vehicles yet"
          description="Add your first vehicle to start tracking fuel, expenses, and maintenance."
          action={<button onClick={() => setOpen(true)} className="btn-primary">Add Your First Vehicle</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {vehicles.map((v) => {
            const vehicleImage = v.photoUrl || defaultVehicleImages[v.vehicleType] || defaultVehicleImages[VehicleType.Car];

            return (
              <div
                key={v.id}
                className="glass-card hover:border-accent/40 hover:bg-white/6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group flex flex-col justify-between overflow-hidden relative"
              >
                {/* Top Image Banner */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  <img
                    src={vehicleImage}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultVehicleImages[v.vehicleType] || defaultVehicleImages[VehicleType.Car];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Floating Top Left Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-md flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-accent" />
                      {vehicleTypeLabel[v.vehicleType]}
                    </span>
                  </div>

                  {/* Top Right Action & Reg */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono font-semibold text-slate-200 border border-white/15">
                      {v.registrationNumber}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(v.id); }}
                      className="btn-danger !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-lg"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Vehicle Name Overlay */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-extrabold text-white tracking-tight group-hover:text-accent transition-colors drop-shadow-md">
                      {v.make} {v.model}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium drop-shadow">{v.year} Model {v.color ? `· ${v.color}` : ''}</p>
                  </div>
                </div>

                {/* Card Content & Badges */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge label={fuelTypeLabel[v.fuelType]} variant={fuelTypeColors[v.fuelType]} />
                    {v.color && <Badge label={v.color} variant="slate" />}
                  </div>

                  {/* Footer Row: Odometer & View Details */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Gauge className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-xs font-semibold">{formatKm(v.currentOdometer)}</span>
                    </div>
                    <Link
                      to={`/vehicles/${v.id}`}
                      className="btn-ghost !py-1.5 !px-3 !text-xs !font-semibold !text-accent hover:!bg-accent/15 hover:!text-white border-accent/20 transition-all flex items-center gap-1"
                    >
                      View Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Vehicle Card */}
          <button
            onClick={() => setOpen(true)}
            className="glass-card border-dashed border-white/20 hover:border-accent/40 hover:bg-white/4 flex flex-col items-center justify-center gap-3 p-8 text-slate-500 hover:text-white transition-all duration-300 group min-h-[260px]"
          >
            <div className="w-12 h-12 rounded-2xl border border-dashed border-white/20 group-hover:border-accent/50 group-hover:bg-accent/10 flex items-center justify-center transition-all text-slate-400 group-hover:text-accent">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold tracking-wide">Add New Vehicle</span>
          </button>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add New Vehicle" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Make *</label>
              <input {...register('make', { required: true })} placeholder="e.g. Toyota, Honda, Yamaha" />
            </div>
            <div className="form-group">
              <label>Model *</label>
              <input {...register('model', { required: true })} placeholder="e.g. Innova Crysta, R15" />
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
              <input {...register('color')} placeholder="Metallic Silver, Pearl White…" />
            </div>
            <div className="form-group">
              <label>Current Odometer (km) *</label>
              <input type="number" {...register('currentOdometer', { required: true })} placeholder="45000" min={0} />
            </div>
          </div>

          <div className="form-group">
            <label>Vehicle Photo Image URL (Optional)</label>
            <input {...register('photoUrl')} placeholder="https://images.unsplash.com/photo-..." />
            <p className="text-[11px] text-slate-500 mt-1">Leave empty to use automatic vehicle type image presets.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Saving…' : 'Add Vehicle'}
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
        title="Delete Vehicle"
        description="Are you sure you want to permanently delete this vehicle and all its fuel, service, insurance, and telemetry history from the database?"
      />
    </div>
  );
}
