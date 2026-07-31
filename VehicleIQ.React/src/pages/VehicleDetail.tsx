import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Car, Fuel, Wrench, Shield, FileCheck, Gauge, Plus, Activity, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import CockpitCard from '../components/cockpit/CockpitCard';
import GaugeRing from '../components/cockpit/GaugeRing';
import RegistrationPlate from '../components/cockpit/RegistrationPlate';
import HealthScoreBadge from '../components/cockpit/HealthScoreBadge';
import TimelineFeed from '../components/cockpit/TimelineFeed';
import type { TimelineItem } from '../components/cockpit/TimelineFeed';
import CockpitButton from '../components/cockpit/CockpitButton';
import Modal from '../components/ui/Modal';
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
import { calculateHealthScore } from '../utils/healthScore';

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
    try {
      const [v, f, s, ins, p] = await Promise.all([
        vehiclesApi.getById(vehicleId),
        fuelEntriesApi.getByVehicle(vehicleId),
        serviceRecordsApi.getByVehicle(vehicleId),
        insuranceApi.getByVehicle(vehicleId),
        pucCertificatesApi.getByVehicle(vehicleId),
      ]);
      setVehicle(v);
      setFuelEntries(f);
      setServiceRecords(s);
      setInsurances(ins);
      setPucs(p);
    } catch (err) {
      // Fallbacks are handled inside each API module
    } finally {
      setLoading(false);
    }
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
    { key: 'overview',  label: 'Digital Twin Overview', icon: <Car className="w-4 h-4" /> },
    { key: 'fuel',      label: 'Fuel Log',              icon: <Fuel className="w-4 h-4" /> },
    { key: 'service',   label: 'Service History',       icon: <Wrench className="w-4 h-4" /> },
    { key: 'insurance', label: 'Insurance Vault',       icon: <Shield className="w-4 h-4" /> },
    { key: 'puc',       label: 'PUC Certificates',      icon: <FileCheck className="w-4 h-4" /> },
  ];

  if (loading) return <div className="cockpit-card h-96 animate-pulse bg-cockpit-surface-2/40" />;
  if (!vehicle) return <p className="text-cockpit-red font-mono p-4">Vehicle unit not found.</p>;

  const activeInsurance = insurances.find(i => !isExpired(i.endDate));
  const latestPuc = pucs[0];

  const validMileages = fuelEntries.filter(f => f.calculatedMileage && f.calculatedMileage > 0).map(f => Number(f.calculatedMileage));
  const avgMileage = validMileages.length > 0 ? (validMileages.reduce((a, b) => a + b, 0) / validMileages.length) : 14.5;
  const health = calculateHealthScore({
    insuranceDaysLeft: activeInsurance ? daysUntil(activeInsurance.endDate) : null,
    pucDaysLeft: latestPuc ? daysUntil(latestPuc.expiryDate) : null,
  });

  const timelineItems: TimelineItem[] = [
    ...fuelEntries.slice(0, 3).map(f => ({
      id: `f-${f.id}`,
      title: `Fuel Refuel: ${f.quantity.toFixed(1)}L`,
      subtitle: `${f.fuelStationName || 'Fuel Station'} • Cost: ₹${f.totalCost}`,
      timestamp: formatDate(f.date),
      statusColor: 'green' as const,
      icon: <Fuel className="w-4 h-4 text-emerald-400" />,
    })),
    ...serviceRecords.slice(0, 3).map(s => ({
      id: `s-${s.id}`,
      title: serviceTypeLabel[s.serviceType],
      subtitle: `${s.garageName || 'Workshop'} • Cost: ₹${s.cost}`,
      timestamp: formatDate(s.date),
      statusColor: 'amber' as const,
      icon: <Wrench className="w-4 h-4 text-cockpit-amber" />,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Digital Twin Header */}
      <div className="flex items-center gap-4">
        <Link to="/vehicles" className="btn-ghost !px-3 !py-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-extrabold text-cockpit-text tracking-tight">
                {vehicle.make} {vehicle.model}
              </h2>
              <RegistrationPlate registrationNumber={vehicle.registrationNumber} size="sm" />
            </div>
            <p className="text-xs font-mono text-cockpit-muted mt-1">
              {vehicle.year} Model • {vehicleTypeLabel[vehicle.vehicleType]} • {fuelTypeLabel[vehicle.fuelType]}
            </p>
          </div>

          <HealthScoreBadge score={health} size="lg" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-cockpit-border overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn flex items-center gap-2 font-mono text-xs ${tab === t.key ? 'active' : ''}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Instrument Gauges Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CockpitCard className="flex flex-col items-center justify-center p-6 text-center">
              <GaugeRing
                value={vehicle.currentOdometer}
                max={100000}
                label="Odometer Distance"
                unit="km"
                color="amber"
                size="lg"
                subtext="Current Reading"
              />
            </CockpitCard>

            <CockpitCard className="flex flex-col items-center justify-center p-6 text-center">
              <GaugeRing
                value={avgMileage}
                max={30}
                label="Fuel Economy Baseline"
                unit="km/L"
                color="green"
                size="lg"
                subtext="Rolling Mileage"
              />
            </CockpitCard>

            <CockpitCard className="flex flex-col items-center justify-center p-6 text-center">
              <GaugeRing
                value={health}
                max={100}
                label="Vehicle Telemetry Health"
                unit="pts"
                color={health >= 80 ? 'green' : health >= 50 ? 'amber' : 'red'}
                size="lg"
                subtext="System Integrity"
              />
            </CockpitCard>
          </div>

          {/* Details & Telemetry Activity Feed Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <CockpitCard className="xl:col-span-2" title="Specification Ledger" subtitle="Vehicle unit registration specs">
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-xs font-mono">
                {[
                  ['Make', vehicle.make],
                  ['Model', vehicle.model],
                  ['Year', vehicle.year],
                  ['Registration No.', vehicle.registrationNumber],
                  ['Color', vehicle.color || 'Custom'],
                  ['Fuel Type', fuelTypeLabel[vehicle.fuelType]],
                  ['Vehicle Type', vehicleTypeLabel[vehicle.vehicleType]],
                  ['Current Odometer', `${vehicle.currentOdometer.toLocaleString()} km`],
                  ['System Status', 'Active & Operational'],
                ].map(([l, v]) => (
                  <div key={l as string} className="p-2.5 rounded-lg bg-cockpit-surface-2/60 border border-cockpit-border/40">
                    <dt className="text-cockpit-muted text-[10px] uppercase font-semibold mb-1">{l}</dt>
                    <dd className="text-cockpit-text font-bold text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
            </CockpitCard>

            {/* Telemetry Activity Feed */}
            <CockpitCard title="Telemetry Event Log" subtitle="Recent fuel & service events">
              <TimelineFeed items={timelineItems} />
            </CockpitCard>
          </div>
        </div>
      )}

      {/* ── FUEL TAB ── */}
      {tab === 'fuel' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('fuel')}>
              Log Fuel Fill-Up
            </CockpitButton>
          </div>
          {fuelEntries.length === 0 ? (
            <EmptyState
              icon={<Fuel className="w-8 h-8 text-cockpit-amber" />}
              title="No fuel entries"
              description="Start tracking fill-ups to calculate rolling mileage efficiency."
              action={<CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('fuel')}>Add First Entry</CockpitButton>}
            />
          ) : (
            <CockpitCard className="!p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Fuel Type</th>
                    <th>Qty (L)</th>
                    <th>Price/L</th>
                    <th>Total Cost</th>
                    <th>Odometer</th>
                    <th>Mileage</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelEntries.map((f) => (
                    <tr key={f.id}>
                      <td className="font-mono text-xs">{formatDate(f.date)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-xs font-mono border border-cockpit-blue/30 bg-cockpit-blue/10 text-cockpit-blue">
                          {fuelTypeLabel[f.fuelType]}
                        </span>
                      </td>
                      <td className="font-mono font-bold">{f.quantity.toFixed(2)}</td>
                      <td className="font-mono">₹{f.pricePerLiter.toFixed(2)}</td>
                      <td className="font-mono font-bold text-cockpit-amber">₹{f.totalCost.toLocaleString()}</td>
                      <td className="font-mono">{f.odometerReading.toLocaleString()} km</td>
                      <td className="font-mono font-bold text-emerald-400">
                        {f.calculatedMileage ? `${f.calculatedMileage.toFixed(1)} km/L` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CockpitCard>
          )}
        </div>
      )}

      {/* ── SERVICE TAB ── */}
      {tab === 'service' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('service')}>
              Log Service Record
            </CockpitButton>
          </div>
          {serviceRecords.length === 0 ? (
            <EmptyState
              icon={<Wrench className="w-8 h-8 text-cockpit-amber" />}
              title="No service records"
              description="Keep a detailed log of every maintenance event and oil change."
              action={<CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('service')}>Add Service Record</CockpitButton>}
            />
          ) : (
            <CockpitCard className="!p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Service Type</th>
                    <th>Garage / Workshop</th>
                    <th>Cost</th>
                    <th>Next Target Date</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRecords.map((s) => (
                    <tr key={s.id}>
                      <td className="font-mono text-xs">{formatDate(s.date)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded text-xs font-mono border border-purple-500/30 bg-purple-500/10 text-purple-300">
                          {serviceTypeLabel[s.serviceType]}
                        </span>
                      </td>
                      <td className="font-medium text-cockpit-text">{s.garageName || 'Authorized Workshop'}</td>
                      <td className="font-mono font-bold text-cockpit-amber">₹{s.cost.toLocaleString()}</td>
                      <td className="font-mono text-cockpit-muted">{s.nextServiceDate ? formatDate(s.nextServiceDate) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CockpitCard>
          )}
        </div>
      )}

      {/* ── INSURANCE TAB ── */}
      {tab === 'insurance' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('insurance')}>
              Add Policy
            </CockpitButton>
          </div>
          {insurances.length === 0 ? (
            <EmptyState
              icon={<Shield className="w-8 h-8 text-cockpit-amber" />}
              title="No insurance records"
              description="Store insurance policies and receive expiration warnings."
              action={<CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('insurance')}>Add Insurance Policy</CockpitButton>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {insurances.map((ins) => {
                const expired = isExpired(ins.endDate);
                const expiringSoon = !expired && isExpiringSoon(ins.endDate);
                return (
                  <CockpitCard
                    key={ins.id}
                    accent={expired ? 'red' : expiringSoon ? 'amber' : 'green'}
                    title={ins.provider}
                    subtitle={`Policy No: ${ins.policyNumber}`}
                  >
                    <dl className="grid grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Coverage</dt>
                        <dd className="text-cockpit-text font-bold mt-0.5">{insuranceCoverageLabel[ins.coverageType]}</dd>
                      </div>
                      <div>
                        <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Annual Premium</dt>
                        <dd className="text-cockpit-amber font-bold mt-0.5">₹{ins.premiumAmount.toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Start Date</dt>
                        <dd className="text-cockpit-text font-bold mt-0.5">{formatDate(ins.startDate)}</dd>
                      </div>
                      <div>
                        <dt className="text-cockpit-muted text-[10px] uppercase font-semibold">Expiration Date</dt>
                        <dd className={`font-bold mt-0.5 ${expired ? 'text-cockpit-red' : expiringSoon ? 'text-cockpit-amber' : 'text-cockpit-green'}`}>
                          {formatDate(ins.endDate)}
                        </dd>
                      </div>
                    </dl>
                  </CockpitCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PUC TAB ── */}
      {tab === 'puc' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('puc')}>
              Add PUC Certificate
            </CockpitButton>
          </div>
          {pucs.length === 0 ? (
            <EmptyState
              icon={<FileCheck className="w-8 h-8 text-cockpit-amber" />}
              title="No PUC certificates"
              description="Keep emission test certificates updated for statutory compliance."
              action={<CockpitButton variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModal('puc')}>Add PUC Certificate</CockpitButton>}
            />
          ) : (
            <CockpitCard className="!p-0 overflow-hidden">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Issue Date</th>
                    <th>Expiry Date</th>
                    <th>Certificate No.</th>
                    <th>Emission Compliance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pucs.map((p) => {
                    const expired = isExpired(p.expiryDate);
                    return (
                      <tr key={p.id}>
                        <td className="font-mono text-xs">{formatDate(p.date)}</td>
                        <td className="font-mono text-xs">{formatDate(p.expiryDate)}</td>
                        <td className="font-mono text-cockpit-text">{p.certificateNumber || '—'}</td>
                        <td className="font-mono text-cockpit-muted">{p.emissionLevel || 'BS-VI Pass'}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${expired ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {expired ? 'EXPIRED' : 'VALID'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CockpitCard>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={modal === 'fuel'} onClose={closeModal} title="Log Fuel Entry">
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
          <div className="flex gap-3 pt-1">
            <CockpitButton type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={fuelForm.formState.isSubmitting} className="flex-1">Save Entry</CockpitButton>
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
            <CockpitButton type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={serviceForm.formState.isSubmitting} className="flex-1">Save Record</CockpitButton>
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
            <CockpitButton type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={insuranceForm.formState.isSubmitting} className="flex-1">Save Policy</CockpitButton>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'puc'} onClose={closeModal} title="Add PUC Certificate">
        <form onSubmit={pucForm.handleSubmit(onAddPuc)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group"><label>Issue Date *</label><input type="date" {...pucForm.register('date', { required: true })} /></div>
            <div className="form-group"><label>Expiry Date *</label><input type="date" {...pucForm.register('expiryDate', { required: true })} /></div>
            <div className="form-group"><label>Certificate No.</label><input {...pucForm.register('certificateNumber')} /></div>
            <div className="form-group"><label>Emission Level</label><input {...pucForm.register('emissionLevel')} placeholder="BS6 Pass…" /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <CockpitButton type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</CockpitButton>
            <CockpitButton type="submit" variant="primary" loading={pucForm.formState.isSubmitting} className="flex-1">Save Certificate</CockpitButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
