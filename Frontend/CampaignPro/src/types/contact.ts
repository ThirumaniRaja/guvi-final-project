export type ContactStatus = 'ACTIVE' | 'UNSUBSCRIBED' | 'BOUNCED';

export interface ContactResponse {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  status: ContactStatus;
  createdAt: string;
}

export interface ContactRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
}
