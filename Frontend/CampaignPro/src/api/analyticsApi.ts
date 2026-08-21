import { axiosInstance } from './axios';
import type { ApiResponse } from '../types/api';
import type { CampaignAnalyticsResponse, OverviewResponse } from '../types/analytics';

export const analyticsApi = {
  async overview(): Promise<OverviewResponse> {
    const { data } = await axiosInstance.get<ApiResponse<OverviewResponse>>('/api/v1/analytics/overview');
    return data.data;
  },
  async campaign(id: number): Promise<CampaignAnalyticsResponse> {
    const { data } = await axiosInstance.get<ApiResponse<CampaignAnalyticsResponse>>(`/api/v1/analytics/campaigns/${id}`);
    return data.data;
  },
};
