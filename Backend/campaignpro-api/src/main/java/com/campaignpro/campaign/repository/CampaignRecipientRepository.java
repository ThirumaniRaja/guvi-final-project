package com.campaignpro.campaign.repository;

import com.campaignpro.campaign.entity.CampaignRecipient;
import com.campaignpro.common.enums.RecipientStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, Long> {
    List<CampaignRecipient> findByCampaignId(Long campaignId);
    List<CampaignRecipient> findByCampaignIdAndStatus(Long campaignId, RecipientStatus status);
    long countByCampaignIdAndStatus(Long campaignId, RecipientStatus status);
    List<CampaignRecipient> findByStatusAndRetriesLessThan(RecipientStatus status, int maxRetries);
}

