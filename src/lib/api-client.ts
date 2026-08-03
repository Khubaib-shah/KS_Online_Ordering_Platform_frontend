import axios from 'axios';
import { PLATFORM_PREFIX } from '@/lib/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

console.log('Debug: API_URL from env:', API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add tenant context header
apiClient.interceptors.request.use(
  (config) => {
    // Check if we have an active tenant
    const tenantId = localStorage.getItem(`${PLATFORM_PREFIX}_active_tenant_id`);
    if (tenantId && !config.headers['x-tenant-id']) {
      config.headers['x-tenant-id'] = tenantId; // Use ID for resolution
    }

    const token = localStorage.getItem(`${PLATFORM_PREFIX}_access_token`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s
apiClient.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login') &&
      !error.config?.url?.includes('/auth/logout')
    ) {
      // Clear token and redirect to login only if it's not a login attempt
      localStorage.removeItem(`${PLATFORM_PREFIX}_access_token`);
      localStorage.removeItem(`${PLATFORM_PREFIX}_user`);
      localStorage.removeItem(`${PLATFORM_PREFIX}_current_user`);
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error.response?.data?.error || error.response?.data || error);
  }
);
