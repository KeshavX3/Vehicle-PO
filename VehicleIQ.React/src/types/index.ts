// TypeScript types matching VehicleIQ API DTOs

export enum VehicleType {
  Car = 0,
  Bike = 1,
  Scooter = 2,
  Truck = 3,
  SUV = 4,
}

export enum FuelType {
  Petrol = 0,
  Diesel = 1,
  CNG = 2,
  Electric = 3,
  Hybrid = 4,
}

export enum ServiceType {
  OilChange = 0,
  TireRotation = 1,
  BrakePad = 2,
  Battery = 3,
  GeneralService = 4,
  ACService = 5,
  WheelAlignment = 6,
  Other = 99,
}

export enum ExpenseCategory {
  Fuel = 0,
  Service = 1,
  Insurance = 2,
  PUC = 3,
  Toll = 4,
  Parking = 5,
  Fine = 6,
  Accessory = 7,
  Wash = 8,
  Other = 99,
}

export enum InsuranceCoverageType {
  ThirdParty = 0,
  Comprehensive = 1,
  ZeroDep = 2,
}

export enum DocumentType {
  RC = 0,
  DrivingLicense = 1,
  Insurance = 2,
  PUC = 3,
  ServiceBill = 4,
  Other = 99,
}

export enum ReminderType {
  Manual = 0,
  InsuranceExpiry = 1,
  PUCExpiry = 2,
  ServiceDue = 3,
}

export enum ReminderStatus {
  Pending = 0,
  Snoozed = 1,
  Completed = 2,
  Dismissed = 3,
}

// ─── DTOs ───────────────────────────────────────────────
export interface UserDto {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface VehicleDto {
  id: number;
  userId: number;
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  color?: string;
  currentOdometer: number;
  photoUrl?: string;
}

export interface FuelEntryDto {
  id: number;
  vehicleId: number;
  date: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  odometerReading: number;
  isFullTank: boolean;
  fuelStationName?: string;
  notes?: string;
  calculatedMileage?: number;
}

export interface ServiceRecordDto {
  id: number;
  vehicleId: number;
  date: string;
  serviceType: ServiceType;
  description?: string;
  cost: number;
  odometerReading?: number;
  garageName?: string;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  notes?: string;
}

export interface ExpenseDto {
  id: number;
  userId: number;
  vehicleId?: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  referenceType?: string;
  referenceId?: number;
}

export interface InsuranceDto {
  id: number;
  vehicleId: number;
  provider: string;
  policyNumber: string;
  coverageType: InsuranceCoverageType;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  notes?: string;
}

export interface PucCertificateDto {
  id: number;
  vehicleId: number;
  date: string;
  expiryDate: string;
  certificateNumber?: string;
  emissionLevel?: string;
  notes?: string;
}

export interface ReminderDto {
  id: number;
  userId: number;
  vehicleId?: number;
  title: string;
  description?: string;
  dueDate: string;
  reminderType: ReminderType;
  status: ReminderStatus;
  snoozedUntil?: string;
  referenceType?: string;
  referenceId?: number;
}

export interface DocumentDto {
  id: number;
  userId: number;
  vehicleId?: number;
  documentType: DocumentType;
  fileName: string;
  originalFileName: string;
  filePath: string;
  contentType: string;
  fileSizeBytes: number;
  referenceType?: string;
  referenceId?: number;
  createdAt: string;
}

// ─── Request types ───────────────────────────────────────
export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  registrationNumber: string;
  vehicleType: VehicleType;
  fuelType: FuelType;
  color?: string;
  photoUrl?: string;
  currentOdometer: number;
}

export interface CreateFuelEntryRequest {
  vehicleId: number;
  date: string;
  fuelType: FuelType;
  quantity: number;
  pricePerLiter: number;
  odometerReading: number;
  isFullTank: boolean;
  fuelStationName?: string;
  notes?: string;
}

export interface CreateServiceRecordRequest {
  vehicleId: number;
  date: string;
  serviceType: ServiceType;
  description?: string;
  cost: number;
  odometerReading?: number;
  garageName?: string;
  nextServiceDate?: string;
  nextServiceOdometer?: number;
  notes?: string;
}

export interface CreateExpenseRequest {
  vehicleId?: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

export interface CreateInsuranceRequest {
  vehicleId: number;
  provider: string;
  policyNumber: string;
  coverageType: InsuranceCoverageType;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  notes?: string;
}

export interface CreatePucCertificateRequest {
  vehicleId: number;
  date: string;
  expiryDate: string;
  certificateNumber?: string;
  emissionLevel?: string;
  notes?: string;
}

export interface CreateReminderRequest {
  vehicleId?: number;
  title: string;
  description?: string;
  dueDate: string;
  reminderType: ReminderType;
}

export interface UpdateReminderStatusRequest {
  status: ReminderStatus;
  snoozedUntil?: string;
}
