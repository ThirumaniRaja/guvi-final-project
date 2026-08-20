package com.campaignpro.tracking.service;

import com.campaignpro.campaign.entity.CampaignRecipient;
import com.campaignpro.campaign.repository.CampaignRecipientRepository;
import com.campaignpro.common.enums.EventType;
import com.campaignpro.common.enums.RecipientStatus;
import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.email.service.EmailTrackingInjector;
import com.campaignpro.tracking.entity.EmailEvent;
import com.campaignpro.tracking.repository.EmailEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TrackingService {

    private final CampaignRecipientRepository recipientRepository;
    private final EmailEventRepository emailEventRepository;
    private final EmailTrackingInjector trackingInjector;

    @Transactional
    public void recordOpen(String token) {
        CampaignRecipient recipient = resolveRecipient(token);
        emailEventRepository.save(EmailEvent.builder()
                .campaign(recipient.getCampaign())
                .recipient(recipient)
                .type(EventType.OPENED)
                .build());
        if (recipient.getStatus() == RecipientStatus.SENT) {
            recipient.setStatus(RecipientStatus.DELIVERED);
            recipientRepository.save(recipient);
        }
    }

    @Transactional
    public String recordClickAndGetTargetUrl(String token, String targetUrl) {
        CampaignRecipient recipient = resolveRecipient(token);
        emailEventRepository.save(EmailEvent.builder()
                .campaign(recipient.getCampaign())
                .recipient(recipient)
                .type(EventType.CLICKED)
                .metadata(targetUrl)
                .build());
        return targetUrl;
    }

    private CampaignRecipient resolveRecipient(String token) {
        Long recipientId;
        try {
            recipientId = trackingInjector.verifyAndExtractRecipientId(token);
        } catch (IllegalArgumentException e) {
            throw new ResourceNotFoundException("Invalid tracking token");
        }
        return recipientRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));
    }
}

