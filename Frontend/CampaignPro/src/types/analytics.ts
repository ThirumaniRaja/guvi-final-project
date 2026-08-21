export interface OverviewResponse {
  totalCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  overallOpenRate: number;
  overallClickRate: number;
}

export interface CampaignAnalyticsResponse {
  campaignId: number;
  totalRecipients: number;
  sent: number;
  failed: number;
  opened: number;
  clicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}
