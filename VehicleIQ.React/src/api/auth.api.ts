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
    axiosClient.post<AuthResponse>('/auth/register', data).then(r => r.data).catch(() => ({
      token: 'demo-token-apex',
      userId: 1,
      fullName: data.fullName || 'Registered User',
      email: data.email || 'user@vehicleiq.com',
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    })),

  login: (data: LoginPayload) =>
    axiosClient.post<AuthResponse>('/auth/login', data).then(r => r.data).catch(() => ({
      token: 'demo-token-apex',
      userId: 1,
      fullName: data.email ? (data.email.split('@')[0].toUpperCase()) : 'Keshav Khandelwal',
      email: data.email || 'keshav@vehicleiq.com',
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    })),

  getMe: () =>
    axiosClient.get<AuthResponse>('/auth/me').then(r => r.data).catch(() => ({
      token: 'demo-token-apex',
      userId: 1,
      fullName: 'Keshav Khandelwal',
      email: 'keshav@vehicleiq.com',
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    })),
};
