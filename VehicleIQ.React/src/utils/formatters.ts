import { format, parseISO, differenceInDays } from 'date-fns';
import { ExpenseCategory, FuelType, ServiceType, VehicleType, InsuranceCoverageType, DocumentType, ReminderType, ReminderStatus } from '../types';

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string): string => {
  try { return format(parseISO(dateStr), 'dd MMM yyyy'); } catch { return dateStr; }
};

export const formatDateShort = (dateStr: string): string => {
  try { return format(parseISO(dateStr), 'dd/MM/yy'); } catch { return dateStr; }
};

export const formatKm = (km: number): string =>
  `${new Intl.NumberFormat('en-IN').format(km)} km`;

export const formatMileage = (mileage?: number): string =>
  mileage ? `${mileage.toFixed(1)} km/L` : 'N/A';

export const daysUntil = (dateStr: string): number =>
  differenceInDays(parseISO(dateStr), new Date());

export const isExpiringSoon = (dateStr: string, days = 30): boolean =>
  daysUntil(dateStr) <= days && daysUntil(dateStr) >= 0;

export const isExpired = (dateStr: string): boolean => daysUntil(dateStr) < 0;

export const vehicleTypeLabel: Record<VehicleType, string> = {
  [VehicleType.Car]: 'Car',
  [VehicleType.Bike]: 'Bike',
  [VehicleType.Scooter]: 'Scooter',
  [VehicleType.Truck]: 'Truck',
  [VehicleType.SUV]: 'SUV',
};

export const fuelTypeLabel: Record<FuelType, string> = {
  [FuelType.Petrol]: 'Petrol',
  [FuelType.Diesel]: 'Diesel',
  [FuelType.CNG]: 'CNG',
  [FuelType.Electric]: 'Electric',
  [FuelType.Hybrid]: 'Hybrid',
};

export const serviceTypeLabel: Record<ServiceType, string> = {
  [ServiceType.OilChange]: 'Oil Change',
  [ServiceType.TireRotation]: 'Tire Rotation',
  [ServiceType.BrakePad]: 'Brake Pad',
  [ServiceType.Battery]: 'Battery',
  [ServiceType.GeneralService]: 'General Service',
  [ServiceType.ACService]: 'AC Service',
  [ServiceType.WheelAlignment]: 'Wheel Alignment',
  [ServiceType.Other]: 'Other',
};

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Fuel]: 'Fuel',
  [ExpenseCategory.Service]: 'Service',
  [ExpenseCategory.Insurance]: 'Insurance',
  [ExpenseCategory.PUC]: 'PUC',
  [ExpenseCategory.Toll]: 'Toll',
  [ExpenseCategory.Parking]: 'Parking',
  [ExpenseCategory.Fine]: 'Fine',
  [ExpenseCategory.Accessory]: 'Accessory',
  [ExpenseCategory.Wash]: 'Wash',
  [ExpenseCategory.Other]: 'Other',
};

export const expenseCategoryColor: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Fuel]: '#3b82f6',
  [ExpenseCategory.Service]: '#8b5cf6',
  [ExpenseCategory.Insurance]: '#10b981',
  [ExpenseCategory.PUC]: '#f59e0b',
  [ExpenseCategory.Toll]: '#6366f1',
  [ExpenseCategory.Parking]: '#ec4899',
  [ExpenseCategory.Fine]: '#ef4444',
  [ExpenseCategory.Accessory]: '#14b8a6',
  [ExpenseCategory.Wash]: '#06b6d4',
  [ExpenseCategory.Other]: '#64748b',
};

export const insuranceCoverageLabel: Record<InsuranceCoverageType, string> = {
  [InsuranceCoverageType.ThirdParty]: 'Third Party',
  [InsuranceCoverageType.Comprehensive]: 'Comprehensive',
  [InsuranceCoverageType.ZeroDep]: 'Zero Depreciation',
};

export const documentTypeLabel: Record<DocumentType, string> = {
  [DocumentType.RC]: 'RC Book',
  [DocumentType.DrivingLicense]: 'Driving License',
  [DocumentType.Insurance]: 'Insurance',
  [DocumentType.PUC]: 'PUC Certificate',
  [DocumentType.ServiceBill]: 'Service Bill',
  [DocumentType.Other]: 'Other',
};

export const reminderTypeLabel: Record<ReminderType, string> = {
  [ReminderType.Manual]: 'Manual',
  [ReminderType.InsuranceExpiry]: 'Insurance Expiry',
  [ReminderType.PUCExpiry]: 'PUC Expiry',
  [ReminderType.ServiceDue]: 'Service Due',
};

export const reminderStatusLabel: Record<ReminderStatus, string> = {
  [ReminderStatus.Pending]: 'Pending',
  [ReminderStatus.Snoozed]: 'Snoozed',
  [ReminderStatus.Completed]: 'Completed',
  [ReminderStatus.Dismissed]: 'Dismissed',
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
