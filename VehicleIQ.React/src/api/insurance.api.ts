import axiosClient from './axiosClient';
import type { InsuranceDto, CreateInsuranceRequest } from '../types';
import { mockInsurance } from './mockData';

export const insuranceApi = {
  getAll: () => axiosClient.get<InsuranceDto[]>('/insurance').then(r => r.data).catch(() => mockInsurance),
  getByVehicle: (vehicleId: number) => axiosClient.get<InsuranceDto[]>(`/insurance/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockInsurance.filter(i => i.vehicleId === vehicleId)),
  create: (data: CreateInsuranceRequest) => axiosClient.post<InsuranceDto>('/insurance', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data })),
  delete: (id: number) => axiosClient.delete(`/insurance/${id}`).catch(() => ({})),
};
