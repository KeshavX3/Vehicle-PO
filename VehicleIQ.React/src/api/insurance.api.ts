import axiosClient from './axiosClient';
import type { InsuranceDto, CreateInsuranceRequest } from '../types';

export const insuranceApi = {
  getAll: () =>
    axiosClient.get<InsuranceDto[]>('/insurances').then(r => r.data),
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<InsuranceDto[]>(`/insurances/vehicle/${vehicleId}`).then(r => r.data),
  create: (data: CreateInsuranceRequest) =>
    axiosClient.post<InsuranceDto>('/insurances', data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/insurances/${id}`),
};
