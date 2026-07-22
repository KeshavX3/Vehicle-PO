import axiosClient from './axiosClient';
import type { FuelEntryDto, CreateFuelEntryRequest } from '../types';

export const fuelEntriesApi = {
  getAll: () =>
    axiosClient.get<FuelEntryDto[]>('/fuelentries').then(r => r.data),
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<FuelEntryDto[]>(`/fuelentries/vehicle/${vehicleId}`).then(r => r.data),
  create: (data: CreateFuelEntryRequest) =>
    axiosClient.post<FuelEntryDto>('/fuelentries', data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/fuelentries/${id}`),
};
