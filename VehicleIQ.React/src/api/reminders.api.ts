import axiosClient from './axiosClient';
import type { ReminderDto, CreateReminderRequest, UpdateReminderStatusRequest } from '../types';
import { mockReminders } from './mockData';

export const remindersApi = {
  getAll: () => axiosClient.get<ReminderDto[]>('/reminders').then(r => r.data).catch(() => mockReminders),
  getByVehicle: (vehicleId: number) => axiosClient.get<ReminderDto[]>(`/reminders/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockReminders.filter(r => r.vehicleId === vehicleId)),
  create: (data: CreateReminderRequest) => axiosClient.post<ReminderDto>('/reminders', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data, status: 0 })),
  updateStatus: (id: number, data: UpdateReminderStatusRequest) => axiosClient.patch<ReminderDto>(`/reminders/${id}/status`, data).then(r => r.data).catch(() => ({ id, ...data } as unknown as ReminderDto)),
  delete: (id: number) => axiosClient.delete(`/reminders/${id}`).catch(() => ({})),
};
