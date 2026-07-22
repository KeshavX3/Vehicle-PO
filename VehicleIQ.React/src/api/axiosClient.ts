import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vehicleiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Toast on errors & handle 401
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vehicleiq_token');
      localStorage.removeItem('vehicleiq_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    } else {
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        'Something went wrong';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
