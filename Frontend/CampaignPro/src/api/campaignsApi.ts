import { axiosInstance } from './axios';
import type { ApiResponse, PageResponse } from '../types/api';
import type {
  CampaignResponse,
  CreateCampaignRequest,
  RecipientResponse,
  ScheduleCampaignRequest,
  UpdateCampaignRequest,
} from '../types/campaign';
import { toQueryParams } from '../utils/queryParams';

export interface CampaignListParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export const campaignsApi = {
  async list(params: CampaignListParams): Promise<PageResponse<CampaignResponse>> {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<CampaignResponse>>>('/api/v1/campaigns', {
      params: toQueryParams({ ...params }),
    });
    return data.data;
  },
  async get(id: number): Promise<CampaignResponse> {
    const { data } = await axiosInstance.get<ApiResponse<CampaignResponse>>(`/api/v1/campaigns/${id}`);
    return data.data;
  },
  async create(payload: CreateCampaignRequest): Promise<CampaignResponse> {
    const { data } = await axiosInstance.post<ApiResponse<CampaignResponse>>('/api/v1/campaigns', payload);
    return data.data;
  },
  async update(id: number, payload: UpdateCampaignRequest): Promise<CampaignResponse> {
    const { data } = await axiosInstance.put<ApiResponse<CampaignResponse>>(`/api/v1/campaigns/${id}`, payload);
    return data.data;
  },
  async sendNow(id: number): Promise<CampaignResponse> {
    const { data } = await axiosInstance.post<ApiResponse<CampaignResponse>>(`/api/v1/campaigns/${id}/send-now`);
    return data.data;
  },
  async schedule(id: number, payload: ScheduleCampaignRequest): Promise<CampaignResponse> {
    const { data } = await axiosInstance.post<ApiResponse<CampaignResponse>>(`/api/v1/campaigns/${id}/schedule`, payload);
    return data.data;
  },
  async cancel(id: number): Promise<CampaignResponse> {
    const { data } = await axiosInstance.post<ApiResponse<CampaignResponse>>(`/api/v1/campaigns/${id}/cancel`);
    return data.data;
  },
  async recipients(id: number): Promise<RecipientResponse[]> {
    const { data } = await axiosInstance.get<ApiResponse<RecipientResponse[]>>(`/api/v1/campaigns/${id}/recipients`);
    return data.data;
  },
};
