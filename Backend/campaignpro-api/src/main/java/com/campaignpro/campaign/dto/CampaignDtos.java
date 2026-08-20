package com.campaignpro.campaign.dto;

import com.campaignpro.common.enums.CampaignStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;

public class CampaignDtos {

    public record CreateCampaignRequest(
            @NotBlank String name,
            @NotNull Long templateId,
            List<Long> contactIds,
            List<Long> groupIds
    ) {}

    public record UpdateCampaignRequest(
            @NotBlank String name,
            @NotNull Long templateId
    ) {}

    public record ScheduleCampaignRequest(
            @NotNull @Future Instant scheduledAt
    ) {}

    public record CampaignResponse(
            Long id,
            String name,
            Long templateId,
            String templateName,
            CampaignStatus status,
            Instant scheduledAt,
            Instant sentAt,
            long recipientCount,
            Instant createdAt
    ) {}

    public record RecipientResponse(
            Long id,
            Long contactId,
            String contactEmail,
            String status,
            int retries,
            String lastError
    ) {}
}

