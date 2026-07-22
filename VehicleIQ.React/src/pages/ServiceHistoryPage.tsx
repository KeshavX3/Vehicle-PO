import { useEffect, useState } from 'react';
import { Wrench, Plus, Trash2, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { serviceRecordsApi } from '../api/serviceRecords.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { ServiceRecordDto, VehicleDto, CreateServiceRecordRequest } from '../types';
import { ServiceType } from '../types';
import { formatCurrency, formatDate, formatKm, serviceTypeLabel } from '../utils/formatters';

export default function ServiceHistoryPage() {
  const [records, setRecords] = useState<ServiceRecordDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateServiceRecordRequest>();

  const loadData = () => {
    Promise.all([serviceRecordsApi.getAll(), vehiclesApi.getAll()])
      .then(([s, v]) => {
        setRecords(s);
        setVehicles(v);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: CreateServiceRecordRequest) => {
    await serviceRecordsApi.create({
      ...data,
      vehicleId: Number(data.vehicleId),
      cost: Number(data.cost),
      odometerReading: Number(data.odometerReading),
      serviceType: Number(data.serviceType),
      nextServiceOdometer: data.nextServiceOdometer ? Number(data.nextServiceOdometer) : undefined,
    });
    toast.success('Service record logged!');
    reset();
    setOpen(false);
    loadData();
  };

  const onDelete = async (id: number) => {
    if (!confirm('Delete this service record?')) return;
    await serviceRecordsApi.delete(id);
    toast.success('Deleted');
    loadData();
  };

  const filtered = selectedVehicleId === 'all'
    ? records
    : records.filter((r) => r.vehicleId === selectedVehicleId);

  const totalCost = filtered.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="form-group min-w-[220px]">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-navy-800 border-white/10 text-white rounded-xl text-sm"
          >
            <option value="all">All Vehicles ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>

        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Service Record
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Service Records"
          value={filtered.length.toString()}
          subtitle="Maintenance logs"
          icon={<Wrench className="w-5 h-5" />}
          ring="blue"
        />
        <StatCard
          title="Total Maintenance Spend"
          value={formatCurrency(totalCost)}
          subtitle="All service invoices"
          icon={<Wrench className="w-5 h-5" />}
          ring="purple"
        />
        <StatCard
          title="Avg Spend Per Service"
          value={filtered.length > 0 ? formatCurrency(totalCost / filtered.length) : '₹0'}
          subtitle="Invoice average"
          icon={<Wrench className="w-5 h-5" />}
          ring="green"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-8 h-8 text-accent" />}
          title="No service records found"
          description="Keep track of garage repairs, engine oil changes, and routine maintenance."
          action={
            <button onClick={() => setOpen(true)} className="btn-primary">
              Log First Service
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
                <th>Type</th>
                <th>Description</th>
                <th>Garage</th>
                <th>Odometer</th>
                <th className="text-right">Cost</th>
                <th>Next Due</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                return (
                  <tr key={r.id} className="group hover:bg-white/4 transition-colors">
                    <td>{formatDate(r.date)}</td>
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
                    <td>
                      <Badge label={serviceTypeLabel[r.serviceType]} variant="blue" />
                    </td>
                    <td className="text-slate-300 max-w-xs truncate">{r.description}</td>
                    <td className="text-slate-400 text-sm">{r.garageName || '—'}</td>
                    <td className="text-slate-300 font-medium">
                      {typeof r.odometerReading === 'number' ? formatKm(r.odometerReading) : '—'}
                    </td>
                    <td className="text-right font-bold text-white">{formatCurrency(r.cost)}</td>
                    <td className="text-xs text-slate-400">
                      {typeof r.nextServiceOdometer === 'number' && r.nextServiceOdometer > 0 ? formatKm(r.nextServiceOdometer) : '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1"
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

      {/* Add Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Log Service Record">
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
              <label>Service Date *</label>
              <input type="date" {...register('date', { required: true })} />
            </div>
            <div className="form-group">
              <label>Service Type *</label>
              <select {...register('serviceType', { required: true })}>
                {Object.entries(ServiceType)
                  .filter(([, v]) => typeof v === 'number')
                  .map(([k, v]) => (
                    <option key={v as number} value={v as number}>
                      {serviceTypeLabel[v as ServiceType]}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Service Description *</label>
            <input {...register('description', { required: true })} placeholder="Oil change, brake pad replace…" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Cost (₹) *</label>
              <input type="number" step="0.01" {...register('cost', { required: true })} />
            </div>
            <div className="form-group">
              <label>Odometer Reading (km) *</label>
              <input type="number" {...register('odometerReading', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Garage / Workshop Name</label>
              <input {...register('garageName')} placeholder="Authorized Service Center" />
            </div>
            <div className="form-group">
              <label>Next Service Target (km)</label>
              <input type="number" {...register('nextServiceOdometer')} placeholder="Target km" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
