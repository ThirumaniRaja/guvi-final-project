import { axiosInstance } from './axios';
import type { ApiResponse, PageResponse } from '../types/api';
import type { ContactRequest, ContactResponse } from '../types/contact';
import { toQueryParams } from '../utils/queryParams';

export interface ContactListParams {
  query?: string;
  page?: number;
  size?: number;
  sort?: string[];
}

export const contactsApi = {
  async list(params: ContactListParams): Promise<PageResponse<ContactResponse>> {
    const { data } = await axiosInstance.get<ApiResponse<PageResponse<ContactResponse>>>('/api/v1/contacts', {
      params: toQueryParams({ ...params }),
    });
    return data.data;
  },
  async get(id: number): Promise<ContactResponse> {
    const { data } = await axiosInstance.get<ApiResponse<ContactResponse>>(`/api/v1/contacts/${id}`);
    return data.data;
  },
  async create(payload: ContactRequest): Promise<ContactResponse> {
    const { data } = await axiosInstance.post<ApiResponse<ContactResponse>>('/api/v1/contacts', payload);
    return data.data;
  },
  async update(id: number, payload: ContactRequest): Promise<ContactResponse> {
    const { data } = await axiosInstance.put<ApiResponse<ContactResponse>>(`/api/v1/contacts/${id}`, payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/api/v1/contacts/${id}`);
  },
};
