import { axiosInstance } from './axios';
import type { ApiResponse, PageResponse } from '../types/api';
import type { PreviewRequest, PreviewResponse, TemplateRequest, TemplateResponse } from '../types/template';
import { toQueryParams } from '../utils/queryParams';

export interface TemplateListParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export const templatesApi = {
  async list(params: TemplateListParams): Promise<PageResponse<TemplateResponse>> {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<TemplateResponse>>>('/api/v1/templates', {
      params: toQueryParams({ ...params }),
    });
    return data.data;
  },
  async get(id: number): Promise<TemplateResponse> {
    const { data } = await axiosInstance.get<ApiResponse<TemplateResponse>>(`/api/v1/templates/${id}`);
    return data.data;
  },
  async create(payload: TemplateRequest): Promise<TemplateResponse> {
    const { data } = await axiosInstance.post<ApiResponse<TemplateResponse>>('/api/v1/templates', payload);
    return data.data;
  },
  async update(id: number, payload: TemplateRequest): Promise<TemplateResponse> {
    const { data } = await axiosInstance.put<ApiResponse<TemplateResponse>>(`/api/v1/templates/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/api/v1/templates/${id}`);
  },
  async preview(id: number, payload: PreviewRequest): Promise<PreviewResponse> {
    const { data } = await axiosInstance.post<ApiResponse<PreviewResponse>>(`/api/v1/templates/${id}/preview`, payload);
    return data.data;
  },
};
