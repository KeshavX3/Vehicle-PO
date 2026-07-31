import axiosClient from './axiosClient';
import type { ExpenseDto, CreateExpenseRequest } from '../types';
import { mockExpenses } from './mockData';

export const expensesApi = {
  getAll: () => axiosClient.get<ExpenseDto[]>('/expenses').then(r => r.data).catch(() => mockExpenses),
  getByVehicle: (vehicleId: number) => axiosClient.get<ExpenseDto[]>(`/expenses/vehicle/${vehicleId}`).then(r => r.data).catch(() => mockExpenses.filter(e => e.vehicleId === vehicleId)),
  create: (data: CreateExpenseRequest) => axiosClient.post<ExpenseDto>('/expenses', data).then(r => r.data).catch(() => ({ id: Date.now(), ...data })),
  delete: (id: number) => axiosClient.delete(`/expenses/${id}`).catch(() => ({})),
};
