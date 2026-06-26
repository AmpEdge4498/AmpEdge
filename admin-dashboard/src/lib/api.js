import axios from 'axios';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor — auto-attach token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — retry on 5xx, handle 401 ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auto-retry on server errors (max 2)
    if (error.response && error.response.status >= 500 && !originalRequest._retryCount) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= 2) {
        await new Promise((r) => setTimeout(r, 1000 * originalRequest._retryCount));
        return api(originalRequest);
      }
    }

    // On 401, redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('adminToken');
      // Will force re-render in App component
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Normalize error
    error.userMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Network error';

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('adminToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
  }
};

export default api;
