import axiosClient from './axiosClient';
import type { DocumentDto } from '../types';

export const documentsApi = {
  getAll: () => axiosClient.get<DocumentDto[]>('/documents').then(r => r.data),
  upload: (formData: FormData) =>
    axiosClient.post<DocumentDto>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/documents/${id}`),
};
