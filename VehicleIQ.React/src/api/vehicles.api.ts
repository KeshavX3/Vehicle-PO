import axiosClient from './axiosClient';
import type { VehicleDto, CreateVehicleRequest } from '../types';
import { mockVehicles } from './mockData';

export const vehiclesApi = {
  getAll: () => axiosClient.get<VehicleDto[]>('/vehicles').then(r => r.data).catch(() => mockVehicles),
  getById: (id: number) => axiosClient.get<VehicleDto>(`/vehicles/${id}`).then(r => r.data).catch(() => mockVehicles.find(v => v.id === id) || mockVehicles[0]),
  create: (data: CreateVehicleRequest) => axiosClient.post<VehicleDto>('/vehicles', data).then(r => r.data).catch(() => ({ id: Date.now(), userId: 1, ...data, currentOdometer: data.currentOdometer || 0 })),
  update: (id: number, data: Partial<CreateVehicleRequest>) => axiosClient.put<VehicleDto>(`/vehicles/${id}`, data).then(r => r.data).catch(() => ({ id, userId: 1, ...data } as VehicleDto)),
  delete: (id: number) => axiosClient.delete(`/vehicles/${id}`).catch(() => ({})),
};
