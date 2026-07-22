import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthResponse } from '../api/auth.api';

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  login: (authData: AuthResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(() => {
    const savedUser = localStorage.getItem('vehicleiq_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('vehicleiq_token');
  });

  const [loading, setLoading] = useState(false);

  const login = (authData: AuthResponse) => {
    setUser(authData);
    setToken(authData.token);
    localStorage.setItem('vehicleiq_token', authData.token);
    localStorage.setItem('vehicleiq_user', JSON.stringify(authData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vehicleiq_token');
    localStorage.removeItem('vehicleiq_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
