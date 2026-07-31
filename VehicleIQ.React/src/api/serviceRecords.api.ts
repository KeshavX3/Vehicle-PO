import axiosClient from './axiosClient';
import type { ServiceRecordDto, CreateServiceRecordRequest } from '../types';
import { mockServices } from './mockData';

export const serviceRecordsApi = {
  getAll: () =>
    axiosClient.get<ServiceRecordDto[]>('/servicerecords').then(r => r.data).catch(() => mockServices),
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<ServiceRecordDto[]>(`/servicerecords/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockServices.filter(s => s.vehicleId === vehicleId)),
  create: (data: CreateServiceRecordRequest) =>
    axiosClient.post<ServiceRecordDto>('/servicerecords', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data })),
  delete: (id: number) => axiosClient.delete(`/servicerecords/${id}`).catch(() => ({})),
};
