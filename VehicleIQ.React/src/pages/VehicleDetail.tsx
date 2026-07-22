import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Car, Fuel, Wrench, Shield, FileCheck, Gauge, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import { vehiclesApi } from '../api/vehicles.api';
import { fuelEntriesApi } from '../api/fuelEntries.api';
import { serviceRecordsApi } from '../api/serviceRecords.api';
import { insuranceApi } from '../api/insurance.api';
import { pucCertificatesApi } from '../api/pucCertificates.api';
import type {
  VehicleDto, FuelEntryDto, ServiceRecordDto, InsuranceDto, PucCertificateDto,
  CreateFuelEntryRequest, CreateServiceRecordRequest, CreateInsuranceRequest, CreatePucCertificateRequest,
} from '../types';
import { FuelType, ServiceType, InsuranceCoverageType } from '../types';
import {
  formatCurrency, formatDate, formatKm, formatMileage,
  fuelTypeLabel, serviceTypeLabel, insuranceCoverageLabel,
  isExpired, isExpiringSoon, daysUntil, vehicleTypeLabel,
} from '../utils/formatters';

type Tab = 'overview' | 'fuel' | 'service' | 'insurance' | 'puc';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const vehicleId = Number(id);

  const [tab, setTab] = useState<Tab>('overview');
  const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
  const [fuelEntries, setFuelEntries] = useState<FuelEntryDto[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordDto[]>([]);
  const [insurances, setInsurances] = useState<InsuranceDto[]>([]);
  const [pucs, setPucs] = useState<PucCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'fuel' | 'service' | 'insurance' | 'puc'>(null);

  const fuelForm = useForm<CreateFuelEntryRequest>();
  const serviceForm = useForm<CreateServiceRecordRequest>();
  const insuranceForm = useForm<CreateInsuranceRequest>();
  const pucForm = useForm<CreatePucCertificateRequest>();

  const loadAll = async () => {
    setLoading(true);
    const [v, f, s, ins, p] = await Promise.all([
      vehiclesApi.getById(vehicleId),
      fuelEntriesApi.getByVehicle(vehicleId),
      serviceRecordsApi.getByVehicle(vehicleId),
      insuranceApi.getByVehicle(vehicleId),
      pucCertificatesApi.getByVehicle(vehicleId),
    ]);
    setVehicle(v); setFuelEntries(f); setServiceRecords(s); setInsurances(ins); setPucs(p);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [vehicleId]);

  const closeModal = () => setModal(null);

  const onAddFuel = async (data: CreateFuelEntryRequest) => {
    await fuelEntriesApi.create({ ...data, vehicleId, quantity: Number(data.quantity), pricePerLiter: Number(data.pricePerLiter), odometerReading: Number(data.odometerReading), fuelType: Number(data.fuelType) });
    toast.success('Fuel entry added!'); fuelForm.reset(); closeModal(); loadAll();
  };

  const onAddService = async (data: CreateServiceRecordRequest) => {
    await serviceRecordsApi.create({ ...data, vehicleId, cost: Number(data.cost), serviceType: Number(data.serviceType), odometerReading: data.odometerReading ? Number(data.odometerReading) : undefined });
    toast.success('Service record added!'); serviceForm.reset(); closeModal(); loadAll();
  };

  const onAddInsurance = async (data: CreateInsuranceRequest) => {
    await insuranceApi.create({ ...data, vehicleId, premiumAmount: Number(data.premiumAmount), coverageType: Number(data.coverageType) });
    toast.success('Insurance added!'); insuranceForm.reset(); closeModal(); loadAll();
  };

  const onAddPuc = async (data: CreatePucCertificateRequest) => {
    await pucCertificatesApi.create({ ...data, vehicleId });
    toast.success('PUC certificate added!'); pucForm.reset(); closeModal(); loadAll();
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',  label: 'Overview',  icon: <Car className="w-4 h-4" /> },
    { key: 'fuel',      label: 'Fuel Log',  icon: <Fuel className="w-4 h-4" /> },
    { key: 'service',   label: 'Service',   icon: <Wrench className="w-4 h-4" /> },
    { key: 'insurance', label: 'Insurance', icon: <Shield className="w-4 h-4" /> },
    { key: 'puc',       label: 'PUC',       icon: <FileCheck className="w-4 h-4" /> },
  ];

  if (loading) return <div className="glass-card h-96 animate-pulse bg-white/3" />;
  if (!vehicle) return <p className="text-red-400">Vehicle not found.</p>;

  const activeInsurance = insurances.find(i => !isExpired(i.endDate));
  const latestPuc = pucs[0];

  return (
    <div className="space-y-5">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Link to="/vehicles" className="btn-ghost !px-3 !py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white">{vehicle.make} {vehicle.model} <span className="text-slate-500 font-normal">({vehicle.year})</span></h2>
          <p className="text-sm text-slate-400">{vehicle.registrationNumber} · {vehicleTypeLabel[vehicle.vehicleType]}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-white/10 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`tab-btn flex items-center gap-2 ${tab === t.key ? 'active' : ''}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up">
          <Card className="md:col-span-2">
            <h3 className="section-title mb-4">Vehicle Details</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {[
                ['Make', vehicle.make], ['Model', vehicle.model], ['Year', vehicle.year],
                ['Registration', vehicle.registrationNumber], ['Color', vehicle.color || '—'],
                ['Fuel Type', fuelTypeLabel[vehicle.fuelType]],
              ].map(([l, v]) => (
                <div key={l as string}>
                  <dt className="text-slate-500 mb-0.5">{l}</dt>
                  <dd className="text-white font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <Gauge className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-slate-400">Odometer</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatKm(vehicle.currentOdometer)}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Insurance</span>
              </div>
              {activeInsurance ? (
                <>
                  <p className="text-sm font-semibold text-white">{activeInsurance.provider}</p>
                  <p className="text-xs text-slate-500">Expires {formatDate(activeInsurance.endDate)}</p>
                  {isExpiringSoon(activeInsurance.endDate) && <Badge label={`${daysUntil(activeInsurance.endDate)}d left`} variant="amber" dot />}
                </>
              ) : <p className="text-sm text-red-400">No active insurance</p>}
            </Card>
            <Card>
              <div className="flex items-center gap-3 mb-2">
                <FileCheck className="w-5 h-5 text-violet-400" />
                <span className="text-sm text-slate-400">PUC</span>
              </div>
              {latestPuc ? (
                <>
                  <p className="text-xs text-slate-500">Expires {formatDate(latestPuc.expiryDate)}</p>
                  {isExpired(latestPuc.expiryDate) ? <Badge label="Expired" variant="red" dot /> :
                    isExpiringSoon(latestPuc.expiryDate) ? <Badge label="Expiring Soon" variant="amber" dot /> :
                    <Badge label="Valid" variant="green" dot />}
                </>
              ) : <p className="text-sm text-red-400">No PUC on record</p>}
            </Card>
          </div>
        </div>
      )}

      {/* ── FUEL ── */}
      {tab === 'fuel' && (
        <div className="animate-slide-up space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModal('fuel')} className="btn-primary"><Plus className="w-4 h-4" /> Add Fuel Entry</button>
          </div>
          {fuelEntries.length === 0 ? (
            <EmptyState icon={<Fuel className="w-8 h-8" />} title="No fuel entries" description="Start tracking to see mileage trends." action={<button onClick={() => setModal('fuel')} className="btn-primary">Add First Entry</button>} />
          ) : (
            <Card className="!p-0 overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Fuel</th><th>Qty (L)</th><th>Rate</th><th>Total</th><th>Odometer</th><th>Mileage</th></tr></thead>
                <tbody>
                  {fuelEntries.map(f => (
                    <tr key={f.id}>
                      <td>{formatDate(f.date)}</td>
                      <td><Badge label={fuelTypeLabel[f.fuelType]} variant="blue" /></td>
                      <td>{f.quantity.toFixed(2)}</td>
                      <td>₹{f.pricePerLiter.toFixed(2)}</td>
                      <td className="font-semibold text-white">{formatCurrency(f.totalCost)}</td>
                      <td>{formatKm(f.odometerReading)}</td>
                      <td className="text-emerald-400">{formatMileage(f.calculatedMileage ?? undefined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* ── SERVICE ── */}
      {tab === 'service' && (
        <div className="animate-slide-up space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModal('service')} className="btn-primary"><Plus className="w-4 h-4" /> Add Service</button>
          </div>
          {serviceRecords.length === 0 ? (
            <EmptyState icon={<Wrench className="w-8 h-8" />} title="No service records" description="Track every maintenance event." action={<button onClick={() => setModal('service')} className="btn-primary">Add Record</button>} />
          ) : (
            <Card className="!p-0 overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Type</th><th>Garage</th><th>Cost</th><th>Next Service</th></tr></thead>
                <tbody>
                  {serviceRecords.map(s => (
                    <tr key={s.id}>
                      <td>{formatDate(s.date)}</td>
                      <td><Badge label={serviceTypeLabel[s.serviceType]} variant="purple" /></td>
                      <td className="text-slate-300">{s.garageName || '—'}</td>
                      <td className="font-semibold text-white">{formatCurrency(s.cost)}</td>
                      <td className="text-slate-400">{s.nextServiceDate ? formatDate(s.nextServiceDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* ── INSURANCE ── */}
      {tab === 'insurance' && (
        <div className="animate-slide-up space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModal('insurance')} className="btn-primary"><Plus className="w-4 h-4" /> Add Insurance</button>
          </div>
          {insurances.length === 0 ? (
            <EmptyState icon={<Shield className="w-8 h-8" />} title="No insurance records" action={<button onClick={() => setModal('insurance')} className="btn-primary">Add Policy</button>} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insurances.map(ins => {
                const expired = isExpired(ins.endDate);
                const expiringSoon = !expired && isExpiringSoon(ins.endDate);
                return (
                  <Card key={ins.id} className={expired ? 'border-red-500/20' : expiringSoon ? 'border-amber-500/20' : ''}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white">{ins.provider}</h4>
                        <p className="text-xs text-slate-500">{ins.policyNumber}</p>
                      </div>
                      {expired ? <Badge label="Expired" variant="red" dot /> :
                        expiringSoon ? <Badge label="Expiring Soon" variant="amber" dot /> :
                        <Badge label="Active" variant="green" dot />}
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <div><dt className="text-slate-500 text-xs">Coverage</dt><dd className="text-white">{insuranceCoverageLabel[ins.coverageType]}</dd></div>
                      <div><dt className="text-slate-500 text-xs">Premium</dt><dd className="text-white font-semibold">{formatCurrency(ins.premiumAmount)}</dd></div>
                      <div><dt className="text-slate-500 text-xs">Start</dt><dd className="text-white">{formatDate(ins.startDate)}</dd></div>
                      <div><dt className="text-slate-500 text-xs">Expiry</dt><dd className={expired ? 'text-red-400' : expiringSoon ? 'text-amber-400' : 'text-white'}>{formatDate(ins.endDate)}</dd></div>
                    </dl>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PUC ── */}
      {tab === 'puc' && (
        <div className="animate-slide-up space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setModal('puc')} className="btn-primary"><Plus className="w-4 h-4" /> Add PUC</button>
          </div>
          {pucs.length === 0 ? (
            <EmptyState icon={<FileCheck className="w-8 h-8" />} title="No PUC records" action={<button onClick={() => setModal('puc')} className="btn-primary">Add Certificate</button>} />
          ) : (
            <Card className="!p-0 overflow-hidden">
              <table className="data-table">
                <thead><tr><th>Issue Date</th><th>Expiry Date</th><th>Certificate No.</th><th>Emission</th><th>Status</th></tr></thead>
                <tbody>
                  {pucs.map(p => {
                    const expired = isExpired(p.expiryDate);
                    return (
                      <tr key={p.id}>
                        <td>{formatDate(p.date)}</td>
                        <td>{formatDate(p.expiryDate)}</td>
                        <td className="font-mono text-slate-300">{p.certificateNumber || '—'}</td>
                        <td>{p.emissionLevel || '—'}</td>
                        <td>{expired ? <Badge label="Expired" variant="red" dot /> : isExpiringSoon(p.expiryDate) ? <Badge label="Expiring" variant="amber" dot /> : <Badge label="Valid" variant="green" dot />}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={modal === 'fuel'} onClose={closeModal} title="Add Fuel Entry">
        <form onSubmit={fuelForm.handleSubmit(onAddFuel)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Date *</label><input type="date" {...fuelForm.register('date', { required: true })} /></div>
            <div className="form-group"><label>Fuel Type *</label>
              <select {...fuelForm.register('fuelType', { required: true })}>
                {Object.entries(FuelType).filter(([, v]) => typeof v === 'number').map(([k, v]) => <option key={v as number} value={v as number}>{k}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Quantity (L) *</label><input type="number" step="0.01" {...fuelForm.register('quantity', { required: true })} /></div>
            <div className="form-group"><label>Price per Litre (₹) *</label><input type="number" step="0.01" {...fuelForm.register('pricePerLiter', { required: true })} /></div>
            <div className="form-group"><label>Odometer (km) *</label><input type="number" {...fuelForm.register('odometerReading', { required: true })} /></div>
            <div className="form-group"><label>Station Name</label><input {...fuelForm.register('fuelStationName')} placeholder="HP, BPCL…" /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="fullTank" {...fuelForm.register('isFullTank')} className="w-4 h-4 rounded accent-blue-500" />
            <label htmlFor="fullTank" className="cursor-pointer">Full tank fill-up</label>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={fuelForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">Save Entry</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'service'} onClose={closeModal} title="Add Service Record">
        <form onSubmit={serviceForm.handleSubmit(onAddService)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Date *</label><input type="date" {...serviceForm.register('date', { required: true })} /></div>
            <div className="form-group"><label>Service Type *</label>
              <select {...serviceForm.register('serviceType', { required: true })}>
                {Object.entries(ServiceType).filter(([, v]) => typeof v === 'number').map(([k, v]) => <option key={v as number} value={v as number}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Cost (₹) *</label><input type="number" step="0.01" {...serviceForm.register('cost', { required: true })} /></div>
            <div className="form-group"><label>Garage Name</label><input {...serviceForm.register('garageName')} /></div>
            <div className="form-group"><label>Odometer (km)</label><input type="number" {...serviceForm.register('odometerReading')} /></div>
            <div className="form-group"><label>Next Service Date</label><input type="date" {...serviceForm.register('nextServiceDate')} /></div>
          </div>
          <div className="form-group"><label>Description</label><input {...serviceForm.register('description')} /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={serviceForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">Save Record</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'insurance'} onClose={closeModal} title="Add Insurance Policy">
        <form onSubmit={insuranceForm.handleSubmit(onAddInsurance)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Provider *</label><input {...insuranceForm.register('provider', { required: true })} placeholder="HDFC ERGO…" /></div>
            <div className="form-group"><label>Policy Number *</label><input {...insuranceForm.register('policyNumber', { required: true })} /></div>
            <div className="form-group"><label>Coverage Type *</label>
              <select {...insuranceForm.register('coverageType', { required: true })}>
                {Object.entries(InsuranceCoverageType).filter(([, v]) => typeof v === 'number').map(([k, v]) => <option key={v as number} value={v as number}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Premium (₹/year) *</label><input type="number" step="0.01" {...insuranceForm.register('premiumAmount', { required: true })} /></div>
            <div className="form-group"><label>Start Date *</label><input type="date" {...insuranceForm.register('startDate', { required: true })} /></div>
            <div className="form-group"><label>End Date *</label><input type="date" {...insuranceForm.register('endDate', { required: true })} /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={insuranceForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">Save Policy</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'puc'} onClose={closeModal} title="Add PUC Certificate">
        <form onSubmit={pucForm.handleSubmit(onAddPuc)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Issue Date *</label><input type="date" {...pucForm.register('date', { required: true })} /></div>
            <div className="form-group"><label>Expiry Date *</label><input type="date" {...pucForm.register('expiryDate', { required: true })} /></div>
            <div className="form-group"><label>Certificate No.</label><input {...pucForm.register('certificateNumber')} /></div>
            <div className="form-group"><label>Emission Level</label><input {...pucForm.register('emissionLevel')} placeholder="BS6…" /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={pucForm.formState.isSubmitting} className="btn-primary flex-1 justify-center">Save Certificate</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
