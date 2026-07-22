import axiosClient from './axiosClient';
import type { ServiceRecordDto, CreateServiceRecordRequest } from '../types';

export const serviceRecordsApi = {
  getAll: () =>
    axiosClient.get<ServiceRecordDto[]>('/servicerecords').then(r => r.data),
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<ServiceRecordDto[]>(`/servicerecords/vehicle/${vehicleId}`).then(r => r.data),
  create: (data: CreateServiceRecordRequest) =>
    axiosClient.post<ServiceRecordDto>('/servicerecords', data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/servicerecords/${id}`),
};
