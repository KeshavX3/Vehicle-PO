import React, { useEffect, useState } from 'react';
import { FileCheck, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import RegistrationPlate from '../components/cockpit/RegistrationPlate';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

import { pucCertificatesApi } from '../api/pucCertificates.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { PucCertificateDto, VehicleDto, CreatePucCertificateRequest } from '../types';
import { formatDate, daysUntil } from '../utils/formatters';

export default function PucPage() {
  const [pucs, setPucs] = useState<PucCertificateDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreatePucCertificateRequest>();

  const loadData = () => {
    Promise.all([pucCertificatesApi.getAll(), vehiclesApi.getAll()])
      .then(([p, v]) => {
        setPucs(p);
        setVehicles(v);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: CreatePucCertificateRequest) => {
    await pucCertificatesApi.create({
      ...data,
      vehicleId: Number(data.vehicleId),
    });
    toast.success('PUC Certificate logged!');
    reset();
    setOpen(false);
    loadData();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await pucCertificatesApi.delete(deleteId);
      toast.success('PUC certificate deleted successfully');
      setDeleteId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete PUC certificate');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-cockpit-text">Emission Testing Vault</h2>
          <p className="text-xs font-mono text-cockpit-muted mt-0.5">{pucs.length} PUC certificates on file</p>
        </div>

        <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
          Add PUC Certificate
        </CockpitButton>
      </div>

      {pucs.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="w-8 h-8 text-cockpit-amber" />}
          title="No PUC certificates logged"
          description="Keep track of emission compliance tests and statutory renewal dates."
          action={
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
              Add First PUC
            </CockpitButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pucs.map((puc) => {
            const vehicle = vehicles.find((v) => v.id === puc.vehicleId);
            const daysLeft = daysUntil(puc.expiryDate);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = !isExpired && daysLeft <= 15;

            return (
              <CockpitCard
                key={puc.id}
                accent={isExpired ? 'red' : isExpiringSoon ? 'amber' : 'green'}
                title={puc.certificateNumber || 'PUC Certificate'}
                subtitle={puc.emissionLevel || 'BS-VI Emission Pass'}
                action={
                  <button
                    onClick={() => setDeleteId(puc.id)}
                    className="btn-cockpit-danger !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete certificate"
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

                <div className="mt-4 pt-3 border-t border-cockpit-border flex items-center justify-between text-xs font-mono">
                  <span className="text-cockpit-muted">Issued: {formatDate(puc.date)}</span>
                  <span className={isExpired ? 'text-cockpit-red font-bold' : 'text-cockpit-green font-bold'}>
                    Expires: {formatDate(puc.expiryDate)}
                  </span>
                </div>
              </CockpitCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add PUC Certificate">
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

          <div className="form-group">
            <label>Certificate Number *</label>
            <input {...register('certificateNumber', { required: true })} placeholder="PUC-987654" />
          </div>

          <div className="form-group">
            <label>Emission Level / Standard</label>
            <input {...register('emissionLevel')} placeholder="BS-VI Compliant (Pass)" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Issue Date *</label>
              <input type="date" {...register('date', { required: true })} />
            </div>
            <div className="form-group">
              <label>Expiry Date *</label>
              <input type="date" {...register('expiryDate', { required: true })} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpen(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Certificate
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
        title="Delete PUC Certificate"
        description="Are you sure you want to delete this PUC certificate?"
      />
    </div>
  );
}
