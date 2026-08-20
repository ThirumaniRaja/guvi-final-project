package com.campaignpro.campaign.mapper;

import com.campaignpro.campaign.dto.CampaignDtos.CampaignResponse;
import com.campaignpro.campaign.dto.CampaignDtos.RecipientResponse;
import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.campaign.entity.CampaignRecipient;
import org.springframework.stereotype.Component;

@Component
public class CampaignMapper {

    public CampaignResponse toResponse(Campaign c, long recipientCount) {
        return new CampaignResponse(
                c.getId(),
                c.getName(),
                c.getTemplate().getId(),
                c.getTemplate().getName(),
                c.getStatus(),
                c.getScheduledAt(),
                c.getSentAt(),
                recipientCount,
                c.getCreatedAt()
        );
    }

    public RecipientResponse toRecipientResponse(CampaignRecipient r) {
        return new RecipientResponse(
                r.getId(),
                r.getContact().getId(),
                r.getContact().getEmail(),
                r.getStatus().name(),
                r.getRetries(),
                r.getLastError()
        );
    }
}

