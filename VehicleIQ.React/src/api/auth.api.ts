import axiosClient from './axiosClient';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  expiresAt: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    axiosClient.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: LoginPayload) =>
    axiosClient.post<AuthResponse>('/auth/login', data).then(r => r.data),

  getMe: () =>
    axiosClient.get<AuthResponse>('/auth/me').then(r => r.data),
};
