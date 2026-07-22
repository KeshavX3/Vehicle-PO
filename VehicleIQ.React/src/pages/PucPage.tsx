import { useEffect, useState } from 'react';
import { FileCheck, Plus, Trash2, Calendar, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { pucCertificatesApi } from '../api/pucCertificates.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { PucCertificateDto, VehicleDto, CreatePucCertificateRequest } from '../types';
import { formatDate, daysUntil } from '../utils/formatters';

export default function PucPage() {
  const [pucs, setPucs] = useState<PucCertificateDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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

  const onDelete = async (id: number) => {
    if (!confirm('Delete this PUC certificate?')) return;
    await pucCertificatesApi.delete(id);
    toast.success('Deleted');
    loadData();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{pucs.length} PUC certificates on file</p>
        <button onClick={() => setOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add PUC Certificate
        </button>
      </div>

      {pucs.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="w-8 h-8 text-accent" />}
          title="No PUC certificates logged"
          description="Keep track of emission compliance tests and renewal dates."
          action={
            <button onClick={() => setOpen(true)} className="btn-primary">
              Add First PUC
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {pucs.map((puc) => {
            const vehicle = vehicles.find((v) => v.id === puc.vehicleId);
            const daysLeft = daysUntil(puc.expiryDate);
            const isExpired = daysLeft < 0;
            const isExpiringSoon = !isExpired && daysLeft <= 15;

            return (
              <div
                key={puc.id}
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
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        label={isExpired ? 'Expired' : isExpiringSoon ? `${daysLeft}d Left` : 'Valid'}
                        variant={isExpired ? 'red' : isExpiringSoon ? 'amber' : 'purple'}
                        dot
                      />
                      <button
                        onClick={() => onDelete(puc.id)}
                        className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base">{puc.certificateNumber}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{puc.emissionLevel || 'BS-VI Compliant'}</p>

                  {vehicle && (
                    <div className="mt-3 p-2.5 rounded-xl bg-white/4 border border-white/6 flex items-center justify-between">
                      <span className="text-xs text-slate-300 font-medium">
                        {vehicle.make} {vehicle.model}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{vehicle.registrationNumber}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-white/8 flex items-center justify-between text-xs text-slate-400">
                  <span>Issued: {formatDate(puc.date)}</span>
                  <span className={isExpired ? 'text-red-400 font-semibold' : 'text-slate-300'}>
                    Expires: {formatDate(puc.expiryDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add PUC Certificate">
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
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">
              Save Certificate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
