package com.campaignpro.analytics.controller;

import com.campaignpro.analytics.dto.AnalyticsDtos.*;
import com.campaignpro.analytics.service.AnalyticsService;
import com.campaignpro.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ApiResponse<OverviewResponse> overview(Authentication auth) {
        return ApiResponse.ok(analyticsService.overview(auth.getName()));
    }

    @GetMapping("/campaigns/{id}")
    public ApiResponse<CampaignAnalyticsResponse> campaign(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(analyticsService.campaignAnalytics(auth.getName(), id));
    }
}

