package com.campaignpro.analytics.dto;

import java.util.Map;

public class AnalyticsDtos {

    public record CampaignAnalyticsResponse(
            Long campaignId,
            long totalRecipients,
            long sent,
            long failed,
            long opened,
            long clicked,
            double deliveryRate,
            double openRate,
            double clickRate
    ) {}

    public record OverviewResponse(
            long totalCampaigns,
            long totalSent,
            long totalOpened,
            long totalClicked,
            long totalFailed,
            double overallOpenRate,
            double overallClickRate
    ) {}

    public record TimeseriesPoint(String day, Map<String, Long> counts) {}
}

