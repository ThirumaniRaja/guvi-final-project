import { axiosInstance } from './axios';
import type { ApiResponse } from '../types/api';
import type { AddMembersRequest, ContactGroupRequest, ContactGroupResponse } from '../types/contactGroup';

export const contactGroupsApi = {
  async list(): Promise<ContactGroupResponse[]> {
    const { data } = await axiosInstance.get<ApiResponse<ContactGroupResponse[]>>('/api/v1/contact-groups');
    return data.data;
  },
  async create(payload: ContactGroupRequest): Promise<ContactGroupResponse> {
    const { data } = await axiosInstance.post<ApiResponse<ContactGroupResponse>>('/api/v1/contact-groups', payload);
    return data.data;
  },
  async remove(id: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/api/v1/contact-groups/${id}`);
  },
  async addMembers(id: number, payload: AddMembersRequest): Promise<ContactGroupResponse> {
    const { data } = await axiosInstance.post<ApiResponse<ContactGroupResponse>>(
      `/api/v1/contact-groups/${id}/members`,
      payload,
    );
    return data.data;
  },
  async removeMember(id: number, contactId: number): Promise<void> {
    await axiosInstance.delete<ApiResponse<void>>(`/api/v1/contact-groups/${id}/members/${contactId}`);
  },
};
