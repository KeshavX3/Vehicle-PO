import React, { useEffect, useState } from 'react';
import {
  Bell, Plus, CheckCircle2, Clock, XCircle, Trash2,
  AlertTriangle, Calendar, Car, Filter, CheckCircle, RotateCcw
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';
import RegistrationPlate from '../components/cockpit/RegistrationPlate';

import { remindersApi } from '../api/reminders.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { ReminderDto, VehicleDto, CreateReminderRequest } from '../types';
import { ReminderStatus, ReminderType } from '../types';
import { formatDate, daysUntil, reminderTypeLabel } from '../utils/formatters';

type TabType = 'all' | 'pending' | 'snoozed' | 'completed';

export default function Reminders() {
  const [reminders, setReminders] = useState<ReminderDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | 'all'>('all');
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateReminderRequest>();

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, vData] = await Promise.all([
        remindersApi.getAll(),
        vehiclesApi.getAll(),
      ]);
      setReminders(rData);
      setVehicles(vData);
    } catch (err) {
      toast.error('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onSubmit = async (data: CreateReminderRequest) => {
    try {
      await remindersApi.create({
        ...data,
        reminderType: Number(data.reminderType),
        vehicleId: data.vehicleId ? Number(data.vehicleId) : undefined,
      });
      toast.success('Reminder task created!');
      reset();
      setOpenModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create reminder');
    }
  };

  const handleMarkDone = async (id: number) => {
    try {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: ReminderStatus.Completed } : r)));
      await remindersApi.updateStatus(id, { status: ReminderStatus.Completed });
      toast.success('Reminder task marked as completed!');
    } catch (err: any) {
      toast.error('Failed to mark as completed');
    }
  };

  const handleSnooze = async (id: number, days: number) => {
    try {
      const snoozeDate = new Date();
      snoozeDate.setDate(snoozeDate.getDate() + days);
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: ReminderStatus.Snoozed, snoozedUntil: snoozeDate.toISOString() } : r)));
      setSnoozeMenuOpen(null);
      await remindersApi.updateStatus(id, {
        status: ReminderStatus.Snoozed,
        snoozedUntil: snoozeDate.toISOString(),
      });
      toast.success(`Snoozed for ${days} days`);
    } catch (err: any) {
      toast.error('Failed to snooze reminder');
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: ReminderStatus.Dismissed } : r)));
      await remindersApi.updateStatus(id, { status: ReminderStatus.Dismissed });
      toast('Reminder dismissed');
    } catch (err: any) {
      toast.error('Failed to dismiss reminder');
    }
  };

  const handleReopen = async (id: number) => {
    try {
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, status: ReminderStatus.Pending } : r)));
      await remindersApi.updateStatus(id, { status: ReminderStatus.Pending });
      toast.success('Reminder restored to pending');
    } catch (err: any) {
      toast.error('Failed to reopen reminder');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      setReminders((prev) => prev.filter((r) => r.id !== deleteId));
      await remindersApi.delete(deleteId);
      toast.success('Reminder deleted successfully');
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete reminder');
    } finally {
      setDeleting(false);
    }
  };

  const vehicleFiltered = selectedVehicleId === 'all'
    ? reminders
    : reminders.filter((r) => r.vehicleId === selectedVehicleId);

  const pending = vehicleFiltered.filter((r) => r.status === ReminderStatus.Pending);
  const snoozed = vehicleFiltered.filter((r) => r.status === ReminderStatus.Snoozed);
  const completed = vehicleFiltered.filter((r) => r.status === ReminderStatus.Completed);
  const overdueCount = pending.filter((r) => daysUntil(r.dueDate) < 0).length;

  const displayedReminders = vehicleFiltered.filter((r) => {
    if (activeTab === 'pending') return r.status === ReminderStatus.Pending;
    if (activeTab === 'snoozed') return r.status === ReminderStatus.Snoozed;
    if (activeTab === 'completed') return r.status === ReminderStatus.Completed || r.status === ReminderStatus.Dismissed;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-cockpit-text">Reminders Kanban</h2>
          <p className="text-xs font-mono text-cockpit-muted mt-0.5">Automated statutory alerts & maintenance task controls</p>
        </div>

        <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpenModal(true)}>
          Create Reminder Task
        </CockpitButton>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <MetricTile
          label="Active Pending Tasks"
          value={pending.length}
          unit="tasks"
          icon={<Bell className="w-5 h-5" />}
          accentColor="blue"
        />
        <MetricTile
          label="Overdue Target Warnings"
          value={overdueCount}
          unit="critical"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="red"
        />
        <MetricTile
          label="Snoozed Reminders"
          value={snoozed.length}
          unit="snoozed"
          icon={<Clock className="w-5 h-5" />}
          accentColor="amber"
        />
        <MetricTile
          label="Completed Tasks"
          value={completed.length}
          unit="done"
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="green"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cockpit-border pb-4">
        <div className="flex items-center gap-1.5 bg-cockpit-surface-2 p-1.5 rounded-xl border border-cockpit-border font-mono text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'pending' ? 'bg-cockpit-amber text-black font-bold' : 'text-cockpit-muted hover:text-cockpit-text'}`}
          >
            PENDING ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('snoozed')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'snoozed' ? 'bg-purple-500 text-white font-bold' : 'text-cockpit-muted hover:text-cockpit-text'}`}
          >
            SNOOZED ({snoozed.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'completed' ? 'bg-emerald-500 text-white font-bold' : 'text-cockpit-muted hover:text-cockpit-text'}`}
          >
            COMPLETED ({completed.length})
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Filter className="w-4 h-4 text-cockpit-amber" />
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-cockpit-surface-2 border-cockpit-border text-cockpit-text rounded-xl"
          >
            <option value="all">All Vehicles ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      {displayedReminders.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-cockpit-amber" />}
          title={`No ${activeTab} reminders`}
          description="All clear! You have no pending vehicle maintenance tasks due."
          action={<CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpenModal(true)}>Create Reminder Task</CockpitButton>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {displayedReminders.map((r) => {
            const days = daysUntil(r.dueDate);
            const isOverdue = r.status === ReminderStatus.Pending && days < 0;
            const isDone = r.status === ReminderStatus.Completed;
            const isSnoozed = r.status === ReminderStatus.Snoozed;
            const vehicle = vehicles.find((v) => v.id === r.vehicleId);

            return (
              <CockpitCard
                key={r.id}
                accent={isOverdue ? 'red' : isSnoozed ? 'amber' : isDone ? 'green' : 'blue'}
                title={r.title}
                subtitle={`Due Date: ${formatDate(r.dueDate)} • ${days < 0 ? 'OVERDUE' : `${days}d left`}`}
                action={
                  <button
                    onClick={() => setDeleteId(r.id)}
                    className="btn-cockpit-danger !p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                }
              >
                {r.description && <p className="text-xs text-cockpit-muted mb-3 leading-relaxed">{r.description}</p>}

                {vehicle && (
                  <div className="mb-4 p-2 rounded-lg bg-cockpit-surface-2/60 border border-cockpit-border flex items-center justify-between">
                    <span className="text-xs font-bold text-cockpit-text">{vehicle.make} {vehicle.model}</span>
                    <RegistrationPlate registrationNumber={vehicle.registrationNumber} size="sm" />
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-cockpit-border flex items-center justify-between gap-2">
                  {r.status === ReminderStatus.Pending && (
                    <>
                      <CockpitButton size="sm" variant="primary" onClick={() => handleMarkDone(r.id)} icon={<CheckCircle className="w-3.5 h-3.5" />}>
                        Done
                      </CockpitButton>
                      <CockpitButton size="sm" variant="secondary" onClick={() => handleSnooze(r.id, 7)} icon={<Clock className="w-3.5 h-3.5" />}>
                        +7 Days
                      </CockpitButton>
                      <CockpitButton size="sm" variant="ghost" onClick={() => handleDismiss(r.id)}>
                        Dismiss
                      </CockpitButton>
                    </>
                  )}

                  {(isDone || isSnoozed) && (
                    <CockpitButton size="sm" variant="secondary" onClick={() => handleReopen(r.id)} icon={<RotateCcw className="w-3.5 h-3.5" />}>
                      Reopen
                    </CockpitButton>
                  )}
                </div>
              </CockpitCard>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={openModal} onClose={() => { setOpenModal(false); reset(); }} title="Create Reminder Task">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Reminder Title *</label>
            <input {...register('title', { required: true })} placeholder="e.g. Engine Oil Synthetic Replace" />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input {...register('description')} placeholder="Workshop notes, target km or policy details..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Target Due Date *</label>
              <input type="date" {...register('dueDate', { required: true })} />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select {...register('reminderType', { required: true })}>
                {Object.entries(ReminderType)
                  .filter(([, v]) => typeof v === 'number')
                  .map(([k, v]) => (
                    <option key={v as number} value={v as number}>
                      {reminderTypeLabel[v as ReminderType]}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Associated Vehicle Unit</label>
            <select {...register('vehicleId')}>
              <option value="">— Entire Fleet —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpenModal(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Create Reminder Task
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
        title="Delete Reminder"
        description="Are you sure you want to delete this reminder?"
      />
    </div>
  );
}
