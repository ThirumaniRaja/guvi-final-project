import { axiosInstance } from './axios';
import type { ApiResponse } from '../types/api';
import type { ChangePasswordRequest, UpdateProfileRequest, UserResponse } from '../types/auth';

export const userApi = {
  async getMe(): Promise<UserResponse> {
    const { data } = await axiosInstance.get<ApiResponse<UserResponse>>('/api/v1/users/me');
    return data.data;
  },
  async updateProfile(payload: UpdateProfileRequest): Promise<UserResponse> {
    const { data } = await axiosInstance.put<ApiResponse<UserResponse>>('/api/v1/users/me', payload);
    return data.data;
  },
  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await axiosInstance.post<ApiResponse<void>>('/api/v1/users/me/change-password', payload);
  },
};
