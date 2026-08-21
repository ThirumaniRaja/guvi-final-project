export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED' | 'FAILED';

export interface CampaignResponse {
  id: number;
  name: string;
  templateId: number;
  templateName: string;
  status: CampaignStatus;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  createdAt: string;
}

export interface CreateCampaignRequest {
  name: string;
  templateId: number;
  contactIds?: number[];
  groupIds?: number[];
}

export interface UpdateCampaignRequest {
  name: string;
  templateId: number;
}

export interface ScheduleCampaignRequest {
  scheduledAt: string;
}

export interface RecipientResponse {
  id: number;
  contactId: number;
  contactEmail: string;
  status: string;
  retries: number;
  lastError?: string;
}
