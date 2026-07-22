import axios from 'axios';
import toast from 'react-hot-toast';

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': '1',
  },
});

// Response interceptor: show toast on errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message ||
      'Something went wrong';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default axiosClient;
