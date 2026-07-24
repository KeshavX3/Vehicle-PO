import { useEffect, useState } from 'react';
import {
  Bell,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  AlertTriangle,
  Calendar,
  Car,
  Filter,
  CheckCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CreateReminderRequest>();

  const loadData = async () => {
    try {
      setLoading(true);
      const [rData, vData] = await Promise.all([
        remindersApi.getAll(false), // fetch all including completed/snoozed
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

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (data: CreateReminderRequest) => {
    try {
      await remindersApi.create({
        ...data,
        reminderType: Number(data.reminderType),
        vehicleId: data.vehicleId ? Number(data.vehicleId) : undefined,
      });
      toast.success('Reminder created successfully!');
      reset();
      setOpenModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create reminder');
    }
  };

  const handleMarkDone = async (id: number) => {
    try {
      await remindersApi.updateStatus(id, { status: ReminderStatus.Completed });
      toast.success('Reminder completed! 🎉');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to mark as done (Error 405)');
    }
  };

  const handleSnooze = async (id: number, days: number) => {
    try {
      const snoozeDate = new Date();
      snoozeDate.setDate(snoozeDate.getDate() + days);
      await remindersApi.updateStatus(id, {
        status: ReminderStatus.Snoozed,
        snoozedUntil: snoozeDate.toISOString(),
      });
      toast(`Snoozed for ${days} days ⏰`, { icon: '⏰' });
      setSnoozeMenuOpen(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to snooze reminder');
    }
  };

  const handleDismiss = async (id: number) => {
    try {
      await remindersApi.updateStatus(id, { status: ReminderStatus.Dismissed });
      toast('Reminder dismissed', { icon: '🚫' });
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to dismiss reminder');
    }
  };

  const handleReopen = async (id: number) => {
    try {
      await remindersApi.updateStatus(id, { status: ReminderStatus.Pending });
      toast.success('Reminder restored to pending');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reopen reminder');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this reminder?')) return;
    try {
      await remindersApi.delete(id);
      toast.success('Reminder deleted');
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete reminder');
    }
  };

  // Filtering
  const vehicleFiltered =
    selectedVehicleId === 'all'
      ? reminders
      : reminders.filter((r) => r.vehicleId === selectedVehicleId);

  const pending = vehicleFiltered.filter(
    (r) => r.status === ReminderStatus.Pending
  );
  const snoozed = vehicleFiltered.filter(
    (r) => r.status === ReminderStatus.Snoozed
  );
  const completed = vehicleFiltered.filter(
    (r) => r.status === ReminderStatus.Completed
  );

  const overdueCount = pending.filter((r) => daysUntil(r.dueDate) < 0).length;
  const urgentCount = pending.filter((r) => {
    const days = daysUntil(r.dueDate);
    return days >= 0 && days <= 7;
  }).length;

  const displayedReminders = vehicleFiltered.filter((r) => {
    if (activeTab === 'pending') return r.status === ReminderStatus.Pending;
    if (activeTab === 'snoozed') return r.status === ReminderStatus.Snoozed;
    if (activeTab === 'completed')
      return r.status === ReminderStatus.Completed || r.status === ReminderStatus.Dismissed;
    return true; // 'all'
  });

  const getReminderTypeBadgeVariant = (type: ReminderType) => {
    switch (type) {
      case ReminderType.InsuranceExpiry:
        return 'amber';
      case ReminderType.PUCExpiry:
        return 'purple';
      case ReminderType.ServiceDue:
        return 'blue';
      default:
        return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">
            Track automated and custom alerts for your fleet maintenance
          </p>
        </div>

        <button onClick={() => setOpenModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Create Reminder
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Pending"
          value={pending.length.toString()}
          subtitle="Action required"
          icon={<Bell className="w-5 h-5 text-blue-400" />}
          ring="blue"
        />
        <StatCard
          title="Overdue Tasks"
          value={overdueCount.toString()}
          subtitle="Past target due date"
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />}
          ring="amber"
        />
        <StatCard
          title="Due Within 7 Days"
          value={urgentCount.toString()}
          subtitle="Upcoming deadlines"
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          ring="amber"
        />
        <StatCard
          title="Completed & Snoozed"
          value={(completed.length + snoozed.length).toString()}
          subtitle={`${completed.length} done · ${snoozed.length} snoozed`}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          ring="green"
        />
      </div>

      {/* Navigation Controls: Tabs & Vehicle Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-navy-800/80 p-1.5 rounded-2xl border border-white/8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-accent text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setActiveTab('snoozed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'snoozed'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Snoozed ({snoozed.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Completed / Dismissed ({completed.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All ({vehicleFiltered.length})
          </button>
        </div>

        {/* Vehicle Selector Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedVehicleId}
            onChange={(e) =>
              setSelectedVehicleId(
                e.target.value === 'all' ? 'all' : Number(e.target.value)
              )
            }
            className="bg-navy-800 border-white/10 text-white rounded-xl text-xs px-3 py-2 focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Fleet Vehicles ({vehicles.length})</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.make} {v.model} ({v.registrationNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card h-36 animate-pulse bg-white/3" />
          ))}
        </div>
      ) : displayedReminders.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-accent" />}
          title={`No ${activeTab} reminders`}
          description={
            activeTab === 'pending'
              ? 'All clear! You have no pending vehicle tasks due.'
              : activeTab === 'snoozed'
              ? 'No reminders currently snoozed.'
              : 'No completed or dismissed reminders.'
          }
          action={
            <button onClick={() => setOpenModal(true)} className="btn-primary">
              Create New Reminder
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayedReminders.map((r) => {
            const days = daysUntil(r.dueDate);
            const isOverdue = r.status === ReminderStatus.Pending && days < 0;
            const isUrgent =
              r.status === ReminderStatus.Pending && !isOverdue && days <= 7;
            const isDone = r.status === ReminderStatus.Completed;
            const isDismissed = r.status === ReminderStatus.Dismissed;
            const isSnoozed = r.status === ReminderStatus.Snoozed;
            const vehicle = vehicles.find((v) => v.id === r.vehicleId);

            return (
              <div
                key={r.id}
                className={`glass-card p-5 transition-all duration-300 group flex flex-col justify-between relative overflow-visible ${
                  isOverdue
                    ? 'border-red-500/40 bg-red-500/5 hover:border-red-500/60 shadow-lg shadow-red-500/5'
                    : isUrgent
                    ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : isSnoozed
                    ? 'border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50'
                    : isDone
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-80'
                    : 'hover:border-accent/40'
                }`}
              >
                <div>
                  {/* Top Badge & Delete */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        label={reminderTypeLabel[r.reminderType]}
                        variant={getReminderTypeBadgeVariant(r.reminderType)}
                      />

                      {/* Time remaining pill */}
                      {isDone ? (
                        <Badge label="Completed" variant="green" dot />
                      ) : isDismissed ? (
                        <Badge label="Dismissed" variant="slate" />
                      ) : isSnoozed ? (
                        <Badge
                          label={
                            r.snoozedUntil
                              ? `Snoozed to ${formatDate(r.snoozedUntil)}`
                              : 'Snoozed'
                          }
                          variant="purple"
                        />
                      ) : isOverdue ? (
                        <Badge
                          label={`Overdue by ${Math.abs(days)}d`}
                          variant="red"
                          dot
                        />
                      ) : days === 0 ? (
                        <Badge label="Due Today" variant="amber" dot />
                      ) : (
                        <Badge label={`Due in ${days}d`} variant="blue" />
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1"
                      title="Delete reminder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className={`font-bold text-base mb-1 transition-colors ${
                      isDone
                        ? 'line-through text-slate-400'
                        : 'text-white group-hover:text-accent'
                    }`}
                  >
                    {r.title}
                  </h3>

                  {r.description && (
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                      {r.description}
                    </p>
                  )}

                  {/* Associated Vehicle Pill */}
                  {vehicle && (
                    <div className="my-3 p-2 rounded-xl bg-white/4 border border-white/6 flex items-center gap-2 text-xs">
                      <Car className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="text-slate-200 font-medium truncate">
                        {vehicle.make} {vehicle.model}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono ml-auto px-1.5 py-0.5 rounded bg-white/6 border border-white/8">
                        {vehicle.registrationNumber}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer: Due Date & Interactive Buttons */}
                <div className="pt-3 border-t border-white/8 mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Due: {formatDate(r.dueDate)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {r.status === ReminderStatus.Pending && (
                    <div className="flex items-center gap-2">
                      {/* Mark Done Button */}
                      <button
                        onClick={() => handleMarkDone(r.id)}
                        className="btn-ghost flex-1 !py-1.5 !px-2.5 !text-xs !font-semibold text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15 hover:text-emerald-300 transition-all flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Done
                      </button>

                      {/* Snooze Options Dropdown */}
                      <div className="relative flex-1">
                        <button
                          onClick={() =>
                            setSnoozeMenuOpen(snoozeMenuOpen === r.id ? null : r.id)
                          }
                          className="btn-ghost w-full !py-1.5 !px-2.5 !text-xs !font-semibold text-purple-400 border-purple-500/30 hover:bg-purple-500/15 hover:text-purple-300 transition-all flex items-center justify-center gap-1"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Snooze
                        </button>

                        {/* Snooze Popup Menu */}
                        {snoozeMenuOpen === r.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-36 bg-navy-900 border border-purple-500/30 rounded-xl shadow-2xl p-1.5 z-20 space-y-1 backdrop-blur-xl animate-fade-in">
                            <button
                              onClick={() => handleSnooze(r.id, 3)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors"
                            >
                              +3 Days
                            </button>
                            <button
                              onClick={() => handleSnooze(r.id, 7)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors"
                            >
                              +7 Days
                            </button>
                            <button
                              onClick={() => handleSnooze(r.id, 14)}
                              className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-purple-500/20 rounded-lg transition-colors"
                            >
                              +14 Days
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dismiss Button */}
                      <button
                        onClick={() => handleDismiss(r.id)}
                        className="btn-ghost !py-1.5 !px-2.5 !text-xs text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-all"
                        title="Dismiss reminder"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Snoozed Actions */}
                  {isSnoozed && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleMarkDone(r.id)}
                        className="btn-ghost flex-1 !py-1.5 !px-2.5 !text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/15"
                      >
                        Mark Done
                      </button>
                      <button
                        onClick={() => handleReopen(r.id)}
                        className="btn-ghost flex-1 !py-1.5 !px-2.5 !text-xs text-slate-300 border-white/10 hover:bg-white/10 flex items-center justify-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Unsnooze
                      </button>
                    </div>
                  )}

                  {/* Completed / Dismissed Actions */}
                  {(isDone || isDismissed) && (
                    <button
                      onClick={() => handleReopen(r.id)}
                      className="btn-ghost w-full !py-1.5 !px-2.5 !text-xs text-slate-400 border-white/10 hover:bg-white/10 flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-open Reminder
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Reminder Modal */}
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          reset();
        }}
        title="Create New Reminder"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label>Reminder Title *</label>
            <input
              {...register('title', { required: true })}
              placeholder="e.g. Annual Insurance Renewal"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <input
              {...register('description')}
              placeholder="Add details, policy number, or workshop notes…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label>Target Due Date *</label>
              <input
                type="date"
                {...register('dueDate', { required: true })}
              />
            </div>

            <div className="form-group">
              <label>Reminder Category *</label>
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
            <label>Associated Vehicle (Optional)</label>
            <select {...register('vehicleId')}>
              <option value="">— General / No Vehicle —</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.make} {v.model} ({v.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpenModal(false);
                reset();
              }}
              className="btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex-1 justify-center"
            >
              {isSubmitting ? 'Creating…' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
