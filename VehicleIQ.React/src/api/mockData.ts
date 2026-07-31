import type { VehicleDto, ExpenseDto, ReminderDto, FuelEntryDto, ServiceRecordDto, InsuranceDto, PucCertificateDto, DocumentDto } from '../types';
import { VehicleType, FuelType, ServiceType, ExpenseCategory, InsuranceCoverageType, DocumentType, ReminderType, ReminderStatus } from '../types';

export const mockVehicles: VehicleDto[] = [
  {
    id: 1,
    userId: 1,
    make: 'Maruti Suzuki',
    model: 'Baleno Alpha',
    year: 2020,
    registrationNumber: 'RJ45CQ4847',
    currentOdometer: 32542,
    color: 'Celestial Blue',
    vehicleType: VehicleType.Car,
    fuelType: FuelType.Petrol,
  },
  {
    id: 2,
    userId: 1,
    make: 'Honda',
    model: 'Activa 1G',
    year: 2006,
    registrationNumber: 'RJ14XS9669',
    currentOdometer: 68784,
    color: 'Silver Metallic',
    vehicleType: VehicleType.Scooter,
    fuelType: FuelType.Petrol,
  },
  {
    id: 3,
    userId: 1,
    make: 'Hero',
    model: 'Passion Pro',
    year: 2012,
    registrationNumber: 'MH12CQ4713',
    currentOdometer: 28000,
    color: 'Black Red',
    vehicleType: VehicleType.Bike,
    fuelType: FuelType.Petrol,
  },
];

export const mockExpenses: ExpenseDto[] = [
  { id: 101, userId: 1, vehicleId: 1, amount: 3450, category: ExpenseCategory.Fuel, date: '2026-07-28', description: 'Full tank refuel at BPCL Highway' },
  { id: 102, userId: 1, vehicleId: 1, amount: 8500, category: ExpenseCategory.Service, date: '2026-07-15', description: 'Synthetic oil change & brake fluid flush' },
  { id: 103, userId: 1, vehicleId: 2, amount: 1200, category: ExpenseCategory.Fuel, date: '2026-07-20', description: 'Petrol refill 12.5L' },
  { id: 104, userId: 1, vehicleId: 1, amount: 4800, category: ExpenseCategory.Insurance, date: '2026-06-10', description: 'Comprehensive insurance renewal' },
  { id: 105, userId: 1, vehicleId: 3, amount: 650, category: ExpenseCategory.PUC, date: '2026-05-18', description: 'PUC emission test certificate' },
];

export const mockReminders: ReminderDto[] = [
  {
    id: 201,
    userId: 1,
    vehicleId: 1,
    title: 'PUC Certificate Renewal',
    description: 'PUC Certificate PUC-234235 expires on 2026-11-18',
    dueDate: '2026-11-18',
    reminderType: ReminderType.PUCExpiry,
    status: ReminderStatus.Pending,
  },
  {
    id: 202,
    userId: 1,
    vehicleId: 1,
    title: 'Insurance Policy Expiry',
    description: 'Policy POL123456 from HDFC ERGO expires on 2027-07-30',
    dueDate: '2027-07-30',
    reminderType: ReminderType.InsuranceExpiry,
    status: ReminderStatus.Pending,
  },
  {
    id: 203,
    userId: 1,
    vehicleId: 2,
    title: 'Engine Oil & Filter Change',
    description: 'Scheduled 70,000 km general service checkup',
    dueDate: '2026-08-15',
    reminderType: ReminderType.ServiceDue,
    status: ReminderStatus.Pending,
  },
];

export const mockFuelEntries: FuelEntryDto[] = [
  { id: 301, vehicleId: 1, date: '2026-07-28', fuelType: FuelType.Petrol, odometerReading: 32542, quantity: 36.5, pricePerLiter: 94.52, totalCost: 3450, isFullTank: true, calculatedMileage: 14.8, fuelStationName: 'BPCL Express' },
  { id: 302, vehicleId: 1, date: '2026-07-10', fuelType: FuelType.Petrol, odometerReading: 32000, quantity: 38.0, pricePerLiter: 94.50, totalCost: 3591, isFullTank: true, calculatedMileage: 15.2, fuelStationName: 'HPCL Station' },
  { id: 303, vehicleId: 2, date: '2026-07-20', fuelType: FuelType.Petrol, odometerReading: 68784, quantity: 12.5, pricePerLiter: 96.00, totalCost: 1200, isFullTank: true, calculatedMileage: 42.0, fuelStationName: 'IOCL Outlet' },
];

export const mockServices: ServiceRecordDto[] = [
  { id: 401, vehicleId: 1, date: '2026-07-15', serviceType: ServiceType.GeneralService, cost: 8500, description: 'Periodic 30,000 km service & oil change', garageName: 'Maruti Authorized Service', odometerReading: 30000, nextServiceOdometer: 40000 },
  { id: 402, vehicleId: 2, date: '2026-04-10', serviceType: ServiceType.GeneralService, cost: 1450, description: 'Carburetor cleaning & spark plug replacement', garageName: 'Local Bike Care', odometerReading: 67500, nextServiceOdometer: 72500 },
];

export const mockInsurance: InsuranceDto[] = [
  { id: 501, vehicleId: 1, policyNumber: 'POL-987654-HDFC', provider: 'HDFC ERGO General Insurance', coverageType: InsuranceCoverageType.Comprehensive, startDate: '2025-07-30', endDate: '2027-07-30', premiumAmount: 4800 },
];

export const mockPuc: PucCertificateDto[] = [
  { id: 601, vehicleId: 1, certificateNumber: 'PUC-234235', date: '2025-11-18', expiryDate: '2026-11-18', emissionLevel: 'BS-VI Compliant (Pass)' },
];

export const mockDocuments: DocumentDto[] = [
  { id: 701, userId: 1, vehicleId: 1, documentType: DocumentType.RC, fileName: 'RC_Book.pdf', originalFileName: 'RC_Book.pdf', filePath: '#', contentType: 'application/pdf', fileSizeBytes: 102400, createdAt: '2025-01-10' },
  { id: 702, userId: 1, vehicleId: 1, documentType: DocumentType.Insurance, fileName: 'Insurance_Policy.pdf', originalFileName: 'Insurance_Policy.pdf', filePath: '#', contentType: 'application/pdf', fileSizeBytes: 204800, createdAt: '2025-07-30' },
];
