import axiosClient from './axiosClient';
import type { ReminderDto, CreateReminderRequest, UpdateReminderStatusRequest } from '../types';

export const remindersApi = {
  getAll: () => axiosClient.get<ReminderDto[]>('/reminders').then(r => r.data),
  create: (data: CreateReminderRequest) =>
    axiosClient.post<ReminderDto>('/reminders', data).then(r => r.data),
  updateStatus: (id: number, data: UpdateReminderStatusRequest) =>
    axiosClient.patch<ReminderDto>(`/reminders/${id}/status`, data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/reminders/${id}`),
};
