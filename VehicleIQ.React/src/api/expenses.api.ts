import axiosClient from './axiosClient';
import type { ExpenseDto, CreateExpenseRequest } from '../types';

export const expensesApi = {
  getAll: () => axiosClient.get<ExpenseDto[]>('/expenses').then(r => r.data),
  getByVehicle: (vehicleId: number) =>
    axiosClient.get<ExpenseDto[]>(`/expenses/vehicle/${vehicleId}`).then(r => r.data),
  create: (data: CreateExpenseRequest) =>
    axiosClient.post<ExpenseDto>('/expenses', data).then(r => r.data),
  delete: (id: number) => axiosClient.delete(`/expenses/${id}`),
};
