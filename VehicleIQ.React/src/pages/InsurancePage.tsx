import { useEffect, useState } from 'react';
import { Shield, Plus, Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { insuranceApi } from '../api/insurance.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { InsuranceDto, VehicleDto, CreateInsuranceRequest } from '../types';
import { InsuranceCoverageType } from '../types';
import { formatCurrency, formatDate, daysUntil, insuranceCoverageLabel } from '../utils/formatters';

import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

export default function InsurancePage() {
  const [insurances, setInsurances] = useState<InsuranceDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateInsuranceRequest>();

  const loadData = () => {
    Promise.all([insuranceApi.getAll(), vehiclesApi.getAll()])
      .then(([i, v]) => {
        setInsurances(i);
        setVehicles(v);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: CreateInsuranceRequest) => {
    await insuranceApi.create({
      ...data,
      vehicleId: Number(data.vehicleId),
      premiumAmount: Number(data.premiumAmount),
      coverageType: Number(data.coverageType),
    });
    toast.success('Insurance policy saved!');
    reset();
    setOpen(false);
    loadData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await insuranceApi.delete(deleteId);
      toast.success('Insurance policy deleted permanently from database');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete insurance policy');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{insurances.length} policies registered</p>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Insurance Policy
        </button>
      </div>

      {insurances.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-8 h-8 text-accent" />}
          title="No insurance policies on record"
          description="Keep track of your vehicle insurance policies, coverage types, and renewal due dates."
          action={
            <button onClick={() => setOpen(true)} className="btn-primary">
              Add First Policy
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {insurances.map((ins) => {
            const vehicle = vehicles.find((v) => v.id === ins.vehicleId);
            const daysLeft = daysUntil(ins.endDate);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = !isExpired && daysLeft <= 30;

            return (
              <div
                key={ins.id}
                className={`glass-card p-5 hover:border-white/15 transition-all duration-300 group flex flex-col justify-between ${
                  isExpired
                    ? 'border-red-500/30 bg-red-500/5'
                    : isExpiringSoon
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        label={isExpired ? 'Expired' : isExpiringSoon ? `${daysLeft}d Left` : 'Active'}
                        variant={isExpired ? 'red' : isExpiringSoon ? 'amber' : 'green'}
                        dot
                      />
                      <button
                        onClick={() => setDeleteId(ins.id)}
                        className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1"
                        title="Delete policy"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base">{ins.provider}</h3>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{ins.policyNumber}</p>

                  {vehicle && (
                    <div className="mt-3 p-2.5 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">
                        {vehicle.make} {vehicle.model}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{vehicle.registrationNumber}</span>
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Coverage Type:</span>
                      <span className="text-white font-medium">
                        {insuranceCoverageLabel[ins.coverageType]}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Premium Amount:</span>
                      <span className="text-emerald-400 font-bold">
                        {formatCurrency(ins.premiumAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/8 flex items-center justify-between text-xs text-slate-400">
                  <span>Starts: {formatDate(ins.startDate)}</span>
                  <span className={isExpired ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                    Expires: {formatDate(ins.endDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add Insurance Policy">
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
              <label>Insurance Provider *</label>
              <input {...register('provider', { required: true })} placeholder="e.g. HDFC ERGO" />
            </div>
            <div className="form-group">
              <label>Policy Number *</label>
              <input {...register('policyNumber', { required: true })} placeholder="POL-123456" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Coverage Type *</label>
              <select {...register('coverageType', { required: true })}>
                {Object.entries(InsuranceCoverageType)
                  .filter(([, v]) => typeof v === 'number')
                  .map(([k, v]) => (
                    <option key={v as number} value={v as number}>
                      {insuranceCoverageLabel[v as InsuranceCoverageType]}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Premium Amount (₹) *</label>
              <input type="number" step="0.01" {...register('premiumAmount', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" {...register('startDate', { required: true })} />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" {...register('endDate', { required: true })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              Save Policy
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
        title="Delete Insurance Policy"
        description="Are you sure you want to permanently delete this insurance policy and its auto-generated expense & reminder from the database?"
      />
    </div>
  );
}
