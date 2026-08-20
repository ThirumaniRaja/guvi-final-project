package com.campaignpro.campaign.controller;

import com.campaignpro.campaign.dto.CampaignDtos.*;
import com.campaignpro.campaign.service.CampaignService;
import com.campaignpro.common.response.ApiResponse;
import com.campaignpro.common.response.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/campaigns")
@RequiredArgsConstructor
@Tag(name = "Campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CampaignResponse> create(@Valid @RequestBody CreateCampaignRequest request, Authentication auth) {
        return ApiResponse.ok("Campaign created", campaignService.create(auth.getName(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<CampaignResponse>> list(Pageable pageable, Authentication auth) {
        return ApiResponse.ok(campaignService.list(auth.getName(), pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<CampaignResponse> get(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(campaignService.getOne(auth.getName(), id));
    }

    @GetMapping("/{id}/recipients")
    public ApiResponse<List<RecipientResponse>> recipients(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(campaignService.recipients(auth.getName(), id));
    }

    @PutMapping("/{id}")
    public ApiResponse<CampaignResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateCampaignRequest request,
                                                 Authentication auth) {
        return ApiResponse.ok("Campaign updated", campaignService.update(auth.getName(), id, request));
    }

    @PostMapping("/{id}/schedule")
    public ApiResponse<CampaignResponse> schedule(@PathVariable Long id, @Valid @RequestBody ScheduleCampaignRequest request,
                                                   Authentication auth) {
        return ApiResponse.ok("Campaign scheduled", campaignService.schedule(auth.getName(), id, request));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<CampaignResponse> cancel(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok("Campaign cancelled", campaignService.cancel(auth.getName(), id));
    }

    @PostMapping("/{id}/send-now")
    public ApiResponse<CampaignResponse> sendNow(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok("Campaign dispatch started", campaignService.sendNow(auth.getName(), id));
    }
}

