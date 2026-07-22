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

const fuelTypeColors: Record<FuelType, 'blue' | 'amber' | 'green' | 'purple' | 'slate'> = {
  [FuelType.Petrol]: 'blue',
  [FuelType.Diesel]: 'amber',
  [FuelType.CNG]: 'green',
  [FuelType.Electric]: 'purple',
  [FuelType.Hybrid]: 'slate',
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateVehicleRequest>();

  const load = () => vehiclesApi.getAll().then(setVehicles).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: CreateVehicleRequest) => {
    await vehiclesApi.create({ ...data, year: Number(data.year), currentOdometer: Number(data.currentOdometer), vehicleType: Number(data.vehicleType), fuelType: Number(data.fuelType) });
    toast.success('Vehicle added!');
    reset();
    setOpen(false);
    load();
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this vehicle and all its data?')) return;
    await vehiclesApi.delete(id);
    toast.success('Vehicle deleted');
    load();
  };

  const vehicleGradients = [
    'from-blue-600/40 to-indigo-600/40',
    'from-violet-600/40 to-purple-600/40',
    'from-emerald-600/40 to-teal-600/40',
    'from-rose-600/40 to-pink-600/40',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in your garage</p>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-52 animate-pulse bg-white/3" />)}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Car className="w-8 h-8" />}
          title="No vehicles yet"
          description="Add your first vehicle to start tracking fuel, expenses, and maintenance."
          action={<button onClick={() => setOpen(true)} className="btn-primary">Add Your First Vehicle</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vehicles.map((v, idx) => (
            <div key={v.id} className="glass-card hover:border-white/15 hover:scale-[1.01] transition-all duration-300 group overflow-hidden">
              {/* Color strip */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${vehicleGradients[idx % vehicleGradients.length]} rounded-t-2xl -mt-5 -mx-5 mb-5 w-[calc(100%+40px)]`} />

              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${vehicleGradients[idx % vehicleGradients.length]} border border-white/10 flex items-center justify-center`}>
                  <Car className="w-7 h-7 text-white" />
                </div>
                <button onClick={() => onDelete(v.id)} className="btn-danger opacity-0 group-hover:opacity-100 !px-2 !py-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white mb-0.5">{v.make} {v.model}</h3>
              <p className="text-sm text-slate-400 mb-3">{v.year} · {v.registrationNumber}</p>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge label={vehicleTypeLabel[v.vehicleType]} variant="blue" />
                <Badge label={fuelTypeLabel[v.fuelType]} variant={fuelTypeColors[v.fuelType]} />
                {v.color && <Badge label={v.color} variant="slate" />}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/8">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Gauge className="w-4 h-4" />
                  <span className="text-sm font-medium text-white">{formatKm(v.currentOdometer)}</span>
                </div>
                <Link to={`/vehicles/${v.id}`}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium transition-colors">
                  View Details <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button onClick={() => setOpen(true)}
            className="glass-card border-dashed hover:bg-white/4 flex flex-col items-center justify-center gap-3 py-12 text-slate-500 hover:text-white transition-all duration-300 group min-h-[220px]">
            <div className="w-12 h-12 rounded-2xl border border-dashed border-white/20 group-hover:border-white/40 flex items-center justify-center transition-all">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Add another vehicle</span>
          </button>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add New Vehicle" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Make *</label>
              <input {...register('make', { required: true })} placeholder="e.g. Toyota" />
            </div>
            <div className="form-group">
              <label>Model *</label>
              <input {...register('model', { required: true })} placeholder="e.g. Innova Crysta" />
            </div>
            <div className="form-group">
              <label>Year *</label>
              <input type="number" {...register('year', { required: true })} placeholder="2022" min={1990} max={2030} />
            </div>
            <div className="form-group">
              <label>Registration No. *</label>
              <input {...register('registrationNumber', { required: true })} placeholder="MH12AB1234" />
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
              <input {...register('color')} placeholder="White, Red…" />
            </div>
            <div className="form-group">
              <label>Current Odometer (km) *</label>
              <input type="number" {...register('currentOdometer', { required: true })} placeholder="45000" min={0} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              {isSubmitting ? 'Saving…' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
