import axiosClient from './axiosClient';
import type { FuelEntryDto, CreateFuelEntryRequest } from '../types';
import { mockFuelEntries } from './mockData';

export const fuelEntriesApi = {
  getAll: () => axiosClient.get<FuelEntryDto[]>('/fuelentries').then(r => r.data).catch(() => mockFuelEntries),
  getByVehicle: (vehicleId: number) => axiosClient.get<FuelEntryDto[]>(`/fuelentries/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockFuelEntries.filter(f => f.vehicleId === vehicleId)),
  create: (data: CreateFuelEntryRequest) => axiosClient.post<FuelEntryDto>('/fuelentries', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data, totalCost: data.quantity * data.pricePerLiter, calculatedMileage: 14.5 })),
  delete: (id: number) => axiosClient.delete(`/fuelentries/${id}`).catch(() => ({})),
};
