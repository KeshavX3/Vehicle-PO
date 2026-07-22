import { useEffect, useState } from 'react';
import { Receipt, Plus, Trash2, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { expensesApi } from '../api/expenses.api';
import { vehiclesApi } from '../api/vehicles.api';
import type { ExpenseDto, VehicleDto, CreateExpenseRequest } from '../types';
import { ExpenseCategory } from '../types';
import { formatCurrency, formatDate, expenseCategoryLabel, expenseCategoryColor } from '../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const categoryVariants: Record<number, 'blue'|'green'|'amber'|'red'|'purple'|'slate'> = {
  0:'blue', 1:'purple', 2:'green', 3:'amber', 4:'slate', 5:'slate', 6:'red', 7:'blue', 8:'green', 99:'slate',
};

export default function Expenses() {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [filter, setFilter] = useState<number | 'all'>('all');
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateExpenseRequest>();

  const load = () => Promise.all([expensesApi.getAll(), vehiclesApi.getAll()]).then(([e, v]) => { setExpenses(e); setVehicles(v); });
  useEffect(() => { load(); }, []);

  const onSubmit = async (data: CreateExpenseRequest) => {
    await expensesApi.create({ ...data, amount: Number(data.amount), category: Number(data.category), vehicleId: data.vehicleId ? Number(data.vehicleId) : undefined });
    toast.success('Expense added!'); reset(); setOpen(false); load();
  };

  const onDelete = async (id: number) => {
    await expensesApi.delete(id); toast.success('Deleted'); load();
  };

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  // Bar chart: monthly totals
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth(); const y = d.getFullYear();
    return {
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
      amount: expenses.filter(e => { const ed = new Date(e.date); return ed.getMonth()===m && ed.getFullYear()===y; }).reduce((s, e) => s + e.amount, 0),
    };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{filtered.length} entries</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary"><Plus className="w-4 h-4" /> Add Expense</button>
      </div>

      {/* Bar Chart */}
      <Card>
        <h3 className="section-title mb-4">Monthly Spending</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData} margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip contentStyle={{ background: '#0d1530', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              formatter={(v: unknown) => [formatCurrency(v as number), 'Spent']} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`badge border cursor-pointer transition-all ${filter === 'all' ? 'bg-accent/20 text-accent border-accent/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
          All
        </button>
        {Object.values(ExpenseCategory).filter(v => typeof v === 'number').map((cat) => (
          <button key={cat as number} onClick={() => setFilter(cat as number)}
            className={`badge border cursor-pointer transition-all ${filter === cat ? 'bg-accent/20 text-accent border-accent/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}>
            {expenseCategoryLabel[cat as ExpenseCategory]}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={<Receipt className="w-8 h-8" />} title="No expenses found"
          action={<button onClick={() => setOpen(true)} className="btn-primary">Add First Expense</button>} />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Vehicle</th><th className="text-right">Amount</th><th></th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="group">
                  <td>{formatDate(e.date)}</td>
                  <td><Badge label={expenseCategoryLabel[e.category]} variant={categoryVariants[e.category] || 'slate'} /></td>
                  <td className="text-slate-300 max-w-xs truncate">{e.description || '—'}</td>
                  <td className="text-slate-400 text-xs">{vehicles.find(v => v.id === e.vehicleId)?.registrationNumber || '—'}</td>
                  <td className="text-right font-semibold text-white">{formatCurrency(e.amount)}</td>
                  <td>
                    <button onClick={() => onDelete(e.id)} className="btn-danger opacity-0 group-hover:opacity-100 !px-2 !py-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => { setOpen(false); reset(); }} title="Add Expense">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Date *</label><input type="date" {...register('date', { required: true })} /></div>
            <div className="form-group"><label>Amount (₹) *</label><input type="number" step="0.01" {...register('amount', { required: true })} /></div>
            <div className="form-group"><label>Category *</label>
              <select {...register('category', { required: true })}>
                {Object.entries(ExpenseCategory).filter(([, v]) => typeof v === 'number').map(([k, v]) => (
                  <option key={v as number} value={v as number}>{expenseCategoryLabel[v as ExpenseCategory]}</option>
                ))}
              </select>
            </div>
            <div className="form-group"><label>Vehicle</label>
              <select {...register('vehicleId')}>
                <option value="">— None —</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Description</label><input {...register('description')} placeholder="Brief note…" /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setOpen(false); reset(); }} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center">Save Expense</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
