import { useEffect, useState } from 'react';
import { Bell, Plus, CheckCircle, Clock, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { remindersApi } from '../api/reminders.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { ReminderDto, VehicleDto, CreateReminderRequest } from '../types';
import { ReminderStatus, ReminderType } from '../types';
import { formatDate, daysUntil, reminderTypeLabel } from '../utils/formatters';

export default function Reminders() {
  const [reminders, setReminders] = useState<ReminderDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateReminderRequest>();

  const load = () => Promise.all([remindersApi.getAll(), vehiclesApi.getAll()]).then(([r, v]) => { setReminders(r); setVehicles(v); });
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: CreateReminderRequest) => {
    await remindersApi.create({ ...data, reminderType: Number(data.reminderType), vehicleId: data.vehicleId ? Number(data.vehicleId) : undefined });
    toast.success('Reminder created!'); reset(); setOpen(false); load();
  };

  const markDone = async (id: number) => {
    await remindersApi.updateStatus(id, { status: ReminderStatus.Completed });
    toast.success('Marked as completed!'); load();
  };

  const snooze = async (id: number) => {
    const snoozeDate = new Date(); snoozeDate.setDate(snoozeDate.getDate() + 7);
    await remindersApi.updateStatus(id, { status: ReminderStatus.Snoozed, snoozedUntil: snoozeDate.toISOString() });
    toast('Snoozed for 7 days', { icon: '😴' }); load();
  };

  const dismiss = async (id: number) => {
    await remindersApi.updateStatus(id, { status: ReminderStatus.Dismissed }); load();
  };

  const pending = reminders.filter(r => r.status === ReminderStatus.Pending);
  const snoozed = reminders.filter(r => r.status === ReminderStatus.Snoozed);
  const completed = reminders.filter(r => r.status === ReminderStatus.Completed);

  const ReminderCard = ({ r, actions }: { r: ReminderDto; actions?: boolean }) => {
    const days = daysUntil(r.dueDate);
    const overdue = days < 0;
    const urgent = !overdue && days <= 7;
    const vehicle = vehicles.find(v => v.id === r.vehicleId);
    return (
      <div className={`p-4 rounded-xl border transition-all duration-200
        ${overdue ? 'bg-red-500/5 border-red-500/20' : urgent ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/4 border-white/8'}`}>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">{r.title}</p>
            {r.description && <p className="text-xs text-slate-500 mt-0.5">{r.description}</p>}
          </div>
          <Badge
            label={overdue ? 'Overdue' : days === 0 ? 'Today' : `${days}d`}
            variant={overdue ? 'red' : urgent ? 'amber' : 'slate'}
          />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <span>{formatDate(r.dueDate)}</span>
          {vehicle && <span>· {vehicle.make} {vehicle.model}</span>}
          <Badge label={reminderTypeLabel[r.reminderType]} variant="blue" />
        </div>
        {actions && (
          <div className="flex gap-2">
            <button onClick={() => markDone(r.id)} className="btn-ghost !px-3 !py-1.5 !text-emerald-400 !border-emerald-500/20 hover:!bg-emerald-500/10 !gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Done
            </button>
            <button onClick={() => snooze(r.id)} className="btn-ghost !px-3 !py-1.5 !gap-1">
              <Clock className="w-3.5 h-3.5" /> Snooze
            </button>
            <button onClick={() => dismiss(r.id)} className="btn-ghost !px-3 !py-1.5 !gap-1 ml-auto">
              <X className="w-3.5 h-3.5" /> Dismiss
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Reminder</button>
      </div>

      {reminders.length === 0 ? (
        <EmptyState icon={<Bell className="w-8 h-8" />} title="No reminders yet"
          description="Add reminders for insurance renewals, service dates, and more."
          action={<button onClick={() => setOpen(true)} className="btn-primary">Create Reminder</button>} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Pending */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="font-semibold text-white text-sm">Pending</h3>
              <span className="ml-auto text-xs text-slate-500">{pending.length}</span>
            </div>
            <div className="space-y-3">
              {pending.length === 0 && <p className="text-slate-500 text-sm text-center py-4">All clear! 🎉</p>}
              {pending.map(r => <ReminderCard key={r.id} r={r} actions />)}
            </div>
          </div>

          {/* Snoozed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <h3 className="font-semibold text-white text-sm">Snoozed</h3>
              <span className="ml-auto text-xs text-slate-500">{snoozed.length}</span>
            </div>
            <div className="space-y-3">
              {snoozed.length === 0 && <p className="text-slate-500 text-sm text-center py-4">Nothing snoozed</p>}
              {snoozed.map(r => <ReminderCard key={r.id} r={r} />)}
            </div>
          </div>

          {/* Completed */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="font-semibold text-white text-sm">Completed</h3>
              <span className="ml-auto text-xs text-slate-500">{completed.length}</span>
            </div>
            <div className="space-y-3">
              {completed.length === 0 && <p className="text-slate-500 text-sm text-center py-4">None completed</p>}
              {completed.map(r => (
                <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-white/2 opacity-60">
                  <p className="text-sm text-slate-400 line-through">{r.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{formatDate(r.dueDate)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Create Reminder">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group"><label>Title *</label><input {...register('title', { required: true })} placeholder="Insurance renewal…" /></div>
          <div className="form-group"><label>Description</label><input {...register('description')} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Due Date *</label><input type="date" {...register('dueDate', { required: true })} /></div>
            <div className="form-group"><label>Reminder Type</label>
              <select {...register('reminderType')}>
                {Object.entries(ReminderType).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{reminderTypeLabel[v as ReminderType]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Vehicle (optional)</label>
            <select {...register('vehicleId')}>
              <option value="">— None —</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
