import { axiosInstance } from './axios';
import type { ApiResponse } from '../types/api';
import type { AuthResponse, LoginRequest, RefreshRequest, RegisterRequest } from '../types/auth';

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload);
    return data.data;
  },
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/v1/auth/register', payload);
    return data.data;
  },
  async refresh(payload: RefreshRequest): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<ApiResponse<AuthResponse>>('/api/v1/auth/refresh', payload);
    return data.data;
  },
  async logout(): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>('/api/v1/auth/logout');
  },
};
