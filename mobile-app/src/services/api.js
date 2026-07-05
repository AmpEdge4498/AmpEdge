import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SecurityService from './SecurityService';

// Use local network IP instead of localhost for Android Emulators
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api/v1' : 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor — Auto-attach token ──
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Attach security headers
      const method = config.method || 'get';
      const url = config.url || '';
      const data = config.data;
      const securityHeaders = await SecurityService.signRequest(method, url, data);
      
      config.headers = {
        ...config.headers,
        ...securityHeaders
      };
      
    } catch (e) {
      console.log('Error attaching headers', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor — Auto-retry on 5xx, handle 401 ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Auto-retry on 5xx (server errors) — max 2 retries
    if (error.response && error.response.status >= 500 && !originalRequest._retryCount) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      if (originalRequest._retryCount <= 2) {
        // Exponential backoff delay
        await new Promise((r) => setTimeout(r, 1000 * originalRequest._retryCount));
        return apiClient(originalRequest);
      }
    }

    // Handle 401 — clear stale token
    if (error.response && error.response.status === 401 && !originalRequest._authRetried) {
      originalRequest._authRetried = true;
      // Could trigger token refresh here in the future
      console.log('[API] 401 received — token may be expired');
    }

    // Normalize error message
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Network error. Please check your connection.';

    error.userMessage = message;

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export default apiClient;
