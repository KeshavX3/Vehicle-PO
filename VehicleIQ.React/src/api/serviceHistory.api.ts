import axiosClient from './axiosClient';
import type { ServiceRecordDto, CreateServiceRecordRequest } from '../types';
import { mockServices } from './mockData';

export const serviceHistoryApi = {
  getAll: () => axiosClient.get<ServiceRecordDto[]>('/servicehistory').then(r => r.data).catch(() => mockServices),
  getByVehicle: (vehicleId: number) => axiosClient.get<ServiceRecordDto[]>(`/servicehistory/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockServices.filter(s => s.vehicleId === vehicleId)),
  create: (data: CreateServiceRecordRequest) => axiosClient.post<ServiceRecordDto>('/servicehistory', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data })),
  delete: (id: number) => axiosClient.delete(`/servicehistory/${id}`).catch(() => ({})),
};
