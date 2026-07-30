import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await serviceRecordsApi.delete(deleteId);
      toast.success('Service record deleted successfully');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete service record');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = selectedVehicleId === 'all'
    ? records
    : records.filter((r) => r.vehicleId === selectedVehicleId);

  const totalCost = filtered.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Bar & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="form-group min-w-[240px]">
          <label>Filter Service Logs by Vehicle</label>
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
          Add Service Record
        </CockpitButton>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricTile
          label="Total Maintenance Events"
          value={filtered.length}
          unit="services"
          icon={<Wrench className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricTile
          label="Total Maintenance Cost"
          value={formatCurrency(totalCost)}
          icon={<Wrench className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricTile
          label="Average Spend Per Service"
          value={filtered.length > 0 ? formatCurrency(totalCost / filtered.length) : '₹0'}
          icon={<Wrench className="w-5 h-5" />}
          accentColor="green"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-8 h-8 text-cockpit-amber" />}
          title="No maintenance records found"
          description="Track every workshop visit, synthetic oil change, and periodic inspection."
          action={
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
              Log First Service
            </CockpitButton>
          }
        />
      ) : (
        <CockpitCard className="!p-0 overflow-hidden" title="Vehicle Maintenance Ledger" subtitle="Itemized workshop records & next targets">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle Unit</th>
                  <th>Service Type</th>
                  <th>Description</th>
                  <th>Garage / Workshop</th>
                  <th>Odometer</th>
                  <th className="text-right">Invoice Cost</th>
                  <th>Next Target Odometer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const vehicle = vehicles.find((v) => v.id === r.vehicleId);
                  return (
                    <tr key={r.id} className="group">
                      <td className="font-mono text-xs">{formatDate(r.date)}</td>
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
                      <td>
                        <span className="px-2.5 py-1 rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-300 font-mono text-xs font-semibold">
                          {serviceTypeLabel[r.serviceType]}
                        </span>
                      </td>
                      <td className="text-slate-300 text-xs max-w-xs truncate">{r.description || 'Periodic Inspection'}</td>
                      <td className="text-slate-200 text-xs">{r.garageName || 'Authorized Service Center'}</td>
                      <td className="font-mono font-semibold text-white">
                        {typeof r.odometerReading === 'number' ? `${r.odometerReading.toLocaleString()} km` : '—'}
                      </td>
                      <td className="text-right font-mono font-bold text-amber-400">{formatCurrency(r.cost)}</td>
                      <td className="font-mono text-xs text-slate-400">
                        {typeof r.nextServiceOdometer === 'number' && r.nextServiceOdometer > 0 ? `${r.nextServiceOdometer.toLocaleString()} km` : '—'}
                      </td>
                      <td>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="btn-cockpit-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1 text-xs"
                          title="Delete record"
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

      {/* Add Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Log Service Record">
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
            <input {...register('description', { required: true })} placeholder="Synthetic oil replace, tire rotation..." />
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
              <input {...register('garageName')} placeholder="Authorized Workshop" />
            </div>
            <div className="form-group">
              <label>Next Target Odometer (km)</label>
              <input type="number" {...register('nextServiceOdometer')} placeholder="e.g. 40000" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpen(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Service Record
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
        title="Delete Service Record"
        description="Are you sure you want to delete this service record?"
      />
    </div>
  );
}
