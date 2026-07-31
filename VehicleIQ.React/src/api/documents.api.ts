import axiosClient from './axiosClient';
import type { DocumentDto } from '../types';
import { mockDocuments } from './mockData';

export const documentsApi = {
  getAll: () => axiosClient.get<DocumentDto[]>('/documents').then(r => r.data).catch(() => mockDocuments),
  getByVehicle: (vehicleId: number) => axiosClient.get<DocumentDto[]>(`/documents/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockDocuments.filter(d => d.vehicleId === vehicleId)),
  create: (data: any) => axiosClient.post<DocumentDto>('/documents', data).then(r => r.data).catch(() => mockDocuments[0]),
  upload: (formData: FormData) => axiosClient.post<DocumentDto>('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data).catch(() => mockDocuments[0]),
  delete: (id: number) => axiosClient.delete(`/documents/${id}`).catch(() => ({})),
};
