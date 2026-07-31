import axiosClient from './axiosClient';
import type { PucCertificateDto, CreatePucCertificateRequest } from '../types';
import { mockPuc } from './mockData';

export const pucApi = {
  getAll: () => axiosClient.get<PucCertificateDto[]>('/puccertificate').then(r => r.data).catch(() => mockPuc),
  getByVehicle: (vehicleId: number) => axiosClient.get<PucCertificateDto[]>(`/puccertificate/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockPuc.filter(p => p.vehicleId === vehicleId)),
  create: (data: CreatePucCertificateRequest) => axiosClient.post<PucCertificateDto>('/puccertificate', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data, isExpired: false, isExpiringSoon: false })),
  delete: (id: number) => axiosClient.delete(`/puccertificate/${id}`).catch(() => ({})),
};
