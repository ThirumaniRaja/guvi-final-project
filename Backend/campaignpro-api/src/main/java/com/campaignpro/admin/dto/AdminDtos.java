package com.campaignpro.admin.dto;

import com.campaignpro.analytics.dto.AnalyticsDtos.OverviewResponse;

import java.util.List;

public class AdminDtos {

    public record AdminDashboardResponse(
            long totalUsers,
            long activeUsers,
            long totalCampaigns,
            OverviewResponse globalAnalytics
    ) {}

    public record RecentAuditEntry(
            String action,
            String entityType,
            String entityId,
            String createdAt
    ) {}

    public record AdminActivityResponse(List<RecentAuditEntry> recent) {}
}

