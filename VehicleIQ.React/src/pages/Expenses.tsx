import React, { useEffect, useState } from 'react';
import { Receipt, Plus, Trash2, TrendingUp, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import CockpitCard from '../components/cockpit/CockpitCard';
import MetricTile from '../components/cockpit/MetricTile';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDeleteModal from '../components/ui/ConfirmDeleteModal';

import { expensesApi } from '../api/expenses.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { ExpenseDto, VehicleDto, CreateExpenseRequest } from '../types';
import { ExpenseCategory } from '../types';
import { formatCurrency, formatDate, expenseCategoryLabel } from '../utils/formatters';

export default function Expenses() {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateExpenseRequest>();

  const load = () => Promise.all([expensesApi.getAll(), vehiclesApi.getAll()]).then(([e, v]) => { setExpenses(e); setVehicles(v); });
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: CreateExpenseRequest) => {
    await expensesApi.create({
      ...data,
      amount: Number(data.amount),
      category: Number(data.category),
      vehicleId: data.vehicleId ? Number(data.vehicleId) : undefined
    });
    toast.success('Expense transaction logged!');
    reset();
    setOpen(false);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await expensesApi.delete(deleteId);
      toast.success('Expense deleted successfully');
      setDeleteId(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Bar chart: 6-month totals
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(); const y = d.getFullYear();
    return {
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      amount: expenses.filter(e => { const ed = new Date(e.date); return ed.getMonth()===m && ed.getFullYear()===y; }).reduce((s, e) => s + e.amount, 0),
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-cockpit-muted block">Financial Ledger</span>
          <h2 className="text-2xl font-black font-mono text-cockpit-amber tracking-tight">{formatCurrency(total)}</h2>
        </div>

        <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
          Add Expense Entry
        </CockpitButton>
      </div>

      {/* Bar Chart Card */}
      <CockpitCard title="Monthly Expenditure Run-Rate" subtitle="6-month financial spend telemetry">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" />
            <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717A', fontSize: 12, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1C1C1F',
                border: '1px solid #2A2A2E',
                borderRadius: 12,
                color: '#F4F4F5',
                fontFamily: 'JetBrains Mono',
                padding: '10px 14px',
              }}
              cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
              formatter={(v: unknown) => [formatCurrency(v as number), 'Spend']}
            />
            <Bar dataKey="amount" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CockpitCard>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-mono text-cockpit-muted mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter Category:
        </span>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
            filter === 'all'
              ? 'bg-cockpit-amber text-black border-cockpit-amber'
              : 'bg-cockpit-surface-2 text-cockpit-muted border-cockpit-border hover:text-cockpit-text'
          }`}
        >
          ALL ({expenses.length})
        </button>
        {Object.values(ExpenseCategory).filter(v => typeof v === 'number').map((cat) => (
          <button
            key={cat as number}
            onClick={() => setFilter(cat as number)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
              filter === cat
                ? 'bg-cockpit-amber text-black border-cockpit-amber'
                : 'bg-cockpit-surface-2 text-cockpit-muted border-cockpit-border hover:text-cockpit-text'
            }`}
          >
            {expenseCategoryLabel[cat as ExpenseCategory]}
          </button>
        ))}
      </div>

      {/* Expense Receipts Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt className="w-8 h-8 text-cockpit-amber" />}
          title="No expense records found"
          description="Log vehicle spending to analyze total ownership cost and category distribution."
          action={<CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>Add First Expense</CockpitButton>}
        />
      ) : (
        <CockpitCard className="!p-0 overflow-hidden" title="Receipt Ledger" subtitle="Itemized vehicle expenditure">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vehicle Unit</th>
                <th className="text-right">Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="group">
                  <td className="font-mono text-xs">{formatDate(e.date)}</td>
                  <td>
                    <span className="px-2.5 py-1 rounded-md border border-cockpit-amber/30 bg-cockpit-amber/10 text-cockpit-amber font-mono text-xs font-semibold">
                      {expenseCategoryLabel[e.category]}
                    </span>
                  </td>
                  <td className="text-cockpit-text text-xs max-w-xs truncate">{e.description || 'General Vehicle Expense'}</td>
                  <td className="font-mono text-xs text-cockpit-muted">
                    {vehicles.find(v => v.id === e.vehicleId)?.registrationNumber || 'Fleet Wide'}
                  </td>
                  <td className="text-right font-mono font-bold text-cockpit-amber">{formatCurrency(e.amount)}</td>
                  <td>
                    <button
                      onClick={() => setDeleteId(e.id)}
                      className="btn-cockpit-danger opacity-0 group-hover:opacity-100 transition-opacity !px-2 !py-1 text-xs"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CockpitCard>
      )}

      {/* Add Expense Modal */}
      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add Expense Entry">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Transaction Date *</label><input type="date" {...register('date', { required: true })} /></div>
            <div className="form-group"><label>Amount (₹) *</label><input type="number" step="0.01" {...register('amount', { required: true })} /></div>
            <div className="form-group"><label>Category *</label>
              <select {...register('category', { required: true })}>
                {Object.entries(ExpenseCategory).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{expenseCategoryLabel[v as ExpenseCategory]}</option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Vehicle Unit</label>
              <select {...register('vehicleId')}>
                <option value="">— Entire Fleet —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.registrationNumber})</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Description</label><input {...register('description')} placeholder="Fuel station, FASTag toll, oil change..." /></div>
          <div className="flex gap-3 pt-2">
            <CockpitButton type="button" variant="secondary" onClick={() => { setOpen(false); reset(); }} className="flex-1">
              Cancel
            </CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={isSubmitting} className="flex-1">
              Save Expense Entry
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
        title="Delete Expense"
        description="Are you sure you want to delete this expense?"
      />
    </div>
  );
}
