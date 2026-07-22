import axiosClient from './axiosClient';
import type { InsuranceDto, CreateInsuranceRequest } from '../types';

export const insuranceApi = {
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<InsuranceDto[]>(`/insurance/vehicle/${vehicleId}`).then(r => r.data),
  create: (data: CreateInsuranceRequest) =>
    axiosClient.post<InsuranceDto>('/insurance', data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/insurance/${id}`),
};
