export interface TemplateResponse {
  id: number;
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  version: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateRequest {
  name: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface PreviewRequest {
  variables?: Record<string, string>;
}

export interface PreviewResponse {
  subject: string;
  html: string;
}
