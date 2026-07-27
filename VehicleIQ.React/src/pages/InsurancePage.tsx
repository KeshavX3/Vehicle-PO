import React, { useEffect, useState } from 'react';
import { Shield, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import RegistrationPlate from '../components/cockpit/RegistrationPlate';

import { insuranceApi } from '../api/insurance.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { InsuranceDto, VehicleDto, CreateInsuranceRequest } from '../types';
import { InsuranceCoverageType } from '../types';
import { formatCurrency, formatDate, daysUntil, insuranceCoverageLabel } from '../utils/formatters';

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
      toast.success('Insurance policy deleted successfully');
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
        <div>
          <h2 className="text-xl font-extrabold text-cockpit-text">Insurance Vault</h2>
          <p className="text-xs font-mono text-cockpit-muted mt-0.5">{insurances.length} active policies registered</p>
        </div>

        <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
          Add Insurance Policy
        </CockpitButton>
      </div>

      {insurances.length === 0 ? (
        <EmptyState
          icon={<Shield className="w-8 h-8 text-cockpit-amber" />}
          title="No insurance policies on record"
          description="Keep track of your vehicle insurance policies, coverage types, and renewal due dates."
          action={
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
              Add First Policy
            </CockpitButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {insurances.map((ins) => {
            const vehicle = vehicles.find((v) => v.id === ins.vehicleId);
            const daysLeft = daysUntil(ins.endDate);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = !isExpired && daysLeft <= 30;

            return (
              <CockpitCard
                key={ins.id}
                accent={isExpired ? 'red' : isExpiringSoon ? 'amber' : 'green'}
                title={ins.provider}
                subtitle={`Policy No: ${ins.policyNumber}`}
                action={
                  <button
                    onClick={() => setDeleteId(ins.id)}
                    className="btn-cockpit-danger !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete policy"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                }
              >
                {vehicle && (
                  <div className="mb-4 p-2.5 rounded-lg bg-cockpit-surface-2/60 border border-cockpit-border flex items-center justify-between">
                    <span className="text-xs font-bold text-cockpit-text">{vehicle.make} {vehicle.model}</span>
                    <RegistrationPlate registrationNumber={vehicle.registrationNumber} size="sm" />
                  </div>
                )}

                <dl className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Coverage Type</dt>
                    <dd className="text-cockpit-text font-bold mt-0.5">{insuranceCoverageLabel[ins.coverageType]}</dd>
                  </div>
                  <div>
                    <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Annual Premium</dt>
                    <dd className="text-cockpit-amber font-bold mt-0.5">{formatCurrency(ins.premiumAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Policy Start</dt>
                    <dd className="text-cockpit-text font-bold mt-0.5">{formatDate(ins.startDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Policy Expiry</dt>
                    <dd className={`font-bold mt-0.5 ${isExpired ? 'text-cockpit-red' : isExpiringSoon ? 'text-cockpit-amber' : 'text-cockpit-green'}`}>
                      {formatDate(ins.endDate)}
                    </dd>
                  </div>
                </dl>
              </CockpitCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add Insurance Policy">
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
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpen(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Policy
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
        title="Delete Insurance Policy"
        description="Are you sure you want to delete this insurance policy?"
      />
    </div>
  );
}
