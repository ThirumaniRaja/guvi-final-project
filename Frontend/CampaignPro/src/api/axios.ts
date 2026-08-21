import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types/api';
import type { AuthResponse } from '../types/auth';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '../utils/tokenStorage';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const PUBLIC_PATHS = ['/api/v1/auth/login', '/api/v1/auth/register', '/api/v1/auth/refresh'];

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  const isPublic = PUBLIC_PATHS.some((path) => config.url?.includes(path));
  if (token && !isPublic) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

function onTokenRefreshed(token: string | null) {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;
    const isPublic = PUBLIC_PATHS.some((path) => originalRequest?.url?.includes(path));

    if (status === 401 && originalRequest && !originalRequest._retry && !isPublic) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            if (token) {
              originalRequest.headers.set('Authorization', `Bearer ${token}`);
              resolve(axiosInstance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post<ApiResponse<AuthResponse>>(`${baseURL}/api/v1/auth/refresh`, {
          refreshToken,
        });
        const auth = data.data;
        setTokens(auth.accessToken, auth.refreshToken);
        onTokenRefreshed(auth.accessToken);
        originalRequest.headers.set('Authorization', `Bearer ${auth.accessToken}`);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        onTokenRefreshed(null);
        clearTokens();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
