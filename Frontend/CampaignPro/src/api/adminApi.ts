import { axiosInstance } from './axios';
import type { ApiResponse, PageResponse } from '../types/api';
import type { AdminActivityResponse, AdminDashboardResponse, UpdateUserStatusRequest } from '../types/admin';
import type { UserResponse } from '../types/auth';
import { toQueryParams } from '../utils/queryParams';

export interface AdminUserListParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export const adminApi = {
  async users(params: AdminUserListParams): Promise<PageResponse<UserResponse>> {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<UserResponse>>>('/api/v1/admin/users', {
      params: toQueryParams({ ...params }),
    });
    return data.data;
  },
  async updateUserStatus(id: number, payload: UpdateUserStatusRequest): Promise<UserResponse> {
    const { data } = await axiosInstance.patch<ApiResponse<UserResponse>>(`/api/v1/admin/users/${id}/status`, payload);
    return data.data;
  },
  async dashboard(): Promise<AdminDashboardResponse> {
    const { data } = await axiosInstance.get<ApiResponse<AdminDashboardResponse>>('/api/v1/admin/dashboard');
    return data.data;
  },
  async activity(): Promise<AdminActivityResponse> {
    const { data } = await axiosInstance.get<ApiResponse<AdminActivityResponse>>('/api/v1/admin/activity');
    return data.data;
  },
};
