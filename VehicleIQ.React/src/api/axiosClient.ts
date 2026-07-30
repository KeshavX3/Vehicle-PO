import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT Bearer Token
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vehicleiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Silent Token Refresh & Toast Handling
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('vehicleiq_refresh_token');

      if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken;

          localStorage.setItem('vehicleiq_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('vehicleiq_refresh_token', newRefreshToken);
          }

          axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return axiosClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          localStorage.removeItem('vehicleiq_token');
          localStorage.removeItem('vehicleiq_refresh_token');
          localStorage.removeItem('vehicleiq_user');

          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('vehicleiq_token');
        localStorage.removeItem('vehicleiq_refresh_token');
        localStorage.removeItem('vehicleiq_user');

        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status !== 401) {
      let message = error.response?.data?.message;
      if (!message && error.response?.data?.errors) {
        const errorEntries = Object.entries(error.response.data.errors);
        if (errorEntries.length > 0 && Array.isArray(errorEntries[0][1]) && errorEntries[0][1].length > 0) {
          message = (errorEntries[0][1] as string[])[0];
        }
      }
      if (!message) {
        message = error.response?.data?.title || error.message || 'Something went wrong';
      }
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
