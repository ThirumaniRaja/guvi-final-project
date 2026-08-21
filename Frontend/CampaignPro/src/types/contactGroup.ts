export interface ContactGroupResponse {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: string;
}

export interface ContactGroupRequest {
  name: string;
  description?: string;
}

export interface AddMembersRequest {
  contactIds: number[];
}
