package com.campaignpro.analytics.service;

import com.campaignpro.analytics.dto.AnalyticsDtos.*;
import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.campaign.repository.CampaignRecipientRepository;
import com.campaignpro.campaign.repository.CampaignRepository;
import com.campaignpro.common.enums.EventType;
import com.campaignpro.common.enums.RecipientStatus;
import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.tracking.repository.EmailEventRepository;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final EmailEventRepository emailEventRepository;
    private final AppUserRepository appUserRepository;

    @Transactional(readOnly = true)
    public CampaignAnalyticsResponse campaignAnalytics(String ownerEmail, Long campaignId) {
        AppUser owner = getOwner(ownerEmail);
        Campaign campaign = campaignRepository.findByIdAndOwnerId(campaignId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));

        long total = recipientRepository.findByCampaignId(campaign.getId()).size();
        long sent = emailEventRepository.countByCampaignIdAndType(campaign.getId(), EventType.SENT);
        long failed = emailEventRepository.countByCampaignIdAndType(campaign.getId(), EventType.FAILED);
        long opened = emailEventRepository.countByCampaignIdAndType(campaign.getId(), EventType.OPENED);
        long clicked = emailEventRepository.countByCampaignIdAndType(campaign.getId(), EventType.CLICKED);

        return new CampaignAnalyticsResponse(
                campaign.getId(), total, sent, failed, opened, clicked,
                rate(sent, total), rate(opened, sent), rate(clicked, sent)
        );
    }

    @Transactional(readOnly = true)
    public OverviewResponse overview(String ownerEmail) {
        AppUser owner = getOwner(ownerEmail);
        long totalCampaigns = campaignRepository.countByOwnerId(owner.getId());
        long sent = emailEventRepository.countByType(EventType.SENT);
        long opened = emailEventRepository.countByType(EventType.OPENED);
        long clicked = emailEventRepository.countByType(EventType.CLICKED);
        long failed = emailEventRepository.countByType(EventType.FAILED);

        return new OverviewResponse(totalCampaigns, sent, opened, clicked, failed,
                rate(opened, sent), rate(clicked, sent));
    }

    @Transactional(readOnly = true)
    public OverviewResponse globalOverview() {
        long totalCampaigns = campaignRepository.count();
        long sent = emailEventRepository.countByType(EventType.SENT);
        long opened = emailEventRepository.countByType(EventType.OPENED);
        long clicked = emailEventRepository.countByType(EventType.CLICKED);
        long failed = emailEventRepository.countByType(EventType.FAILED);

        return new OverviewResponse(totalCampaigns, sent, opened, clicked, failed,
                rate(opened, sent), rate(clicked, sent));
    }

    private double rate(long numerator, long denominator) {
        if (denominator == 0) return 0.0;
        return Math.round((numerator * 10000.0 / denominator)) / 100.0;
    }

    private AppUser getOwner(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

