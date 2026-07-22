import axiosClient from './axiosClient';
import type { PucCertificateDto, CreatePucCertificateRequest } from '../types';

export const pucCertificatesApi = {
  getAll: () =>
    axiosClient.get<PucCertificateDto[]>('/puccertificates').then(r => r.data),
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<PucCertificateDto[]>(`/puccertificates/vehicle/${vehicleId}`).then(r => r.data),
  create: (data: CreatePucCertificateRequest) =>
    axiosClient.post<PucCertificateDto>('/puccertificates', data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/puccertificates/${id}`),
};
