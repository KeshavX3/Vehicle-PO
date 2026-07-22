import axiosClient from './axiosClient';
import type { VehicleDto, CreateVehicleRequest } from '../types';

export const vehiclesApi = {
  getAll: () => axiosClient.get<VehicleDto[]>('/vehicles').then(r => r.data),
  getById: (id: number) => axiosClient.get<VehicleDto>(`/vehicles/${id}`).then(r => r.data),
  create: (data: CreateVehicleRequest) => axiosClient.post<VehicleDto>('/vehicles', data).then(r => r.data),
  update: (id: number, data: Partial<CreateVehicleRequest>) => axiosClient.put<VehicleDto>(`/vehicles/${id}`, data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/vehicles/${id}`),
};
