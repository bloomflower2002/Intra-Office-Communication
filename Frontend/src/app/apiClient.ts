import axios from 'axios';

// Centralized Axios instance. In production this would point to the OSTA IOCMS backend.
// Base URL is read from Vite env so the same build can target dev/staging/prod APIs.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const raw = sessionStorage.getItem('iocms_auth');
  if (raw) {
    const { token } = JSON.parse(raw) as { token: string };
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest) {
      sessionStorage.removeItem('iocms_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
