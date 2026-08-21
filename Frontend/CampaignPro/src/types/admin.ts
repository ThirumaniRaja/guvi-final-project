import type { OverviewResponse } from './analytics';

export interface AdminDashboardResponse {
  totalUsers: number;
  activeUsers: number;
  totalCampaigns: number;
  globalAnalytics: OverviewResponse;
}

export interface RecentAuditEntry {
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
}

export interface AdminActivityResponse {
  recent: RecentAuditEntry[];
}

export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'SUSPENDED';
}
