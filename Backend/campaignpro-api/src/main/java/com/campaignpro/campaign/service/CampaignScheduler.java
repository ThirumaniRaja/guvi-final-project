package com.campaignpro.campaign.service;

import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.campaign.repository.CampaignRepository;
import com.campaignpro.common.enums.CampaignStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Polls for due scheduled campaigns and dispatches them.
 * In a multi-instance deployment, guard this with a distributed lock
 * (e.g., ShedLock) to avoid duplicate dispatch.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CampaignScheduler {

    private final CampaignRepository campaignRepository;
    private final CampaignDeliveryService deliveryService;

    @Scheduled(fixedDelayString = "${app.campaign.scheduler-poll-ms:30000}")
    @Transactional
    public void dispatchDueCampaigns() {
        List<Campaign> due = campaignRepository.findByStatusAndScheduledAtLessThanEqual(
                CampaignStatus.SCHEDULED, Instant.now());

        for (Campaign campaign : due) {
            log.info("Dispatching scheduled campaign {}", campaign.getId());
            deliveryService.dispatchCampaignAsync(campaign.getId());
        }
    }

    @Scheduled(fixedDelayString = "${app.campaign.retry-poll-ms:60000}")
    public void retryFailedCampaigns() {
        List<Campaign> sending = campaignRepository.findByStatusAndScheduledAtLessThanEqual(
                CampaignStatus.SENDING, Instant.now());
        for (Campaign campaign : sending) {
            deliveryService.retryFailedRecipients(campaign.getId());
        }
    }
}

