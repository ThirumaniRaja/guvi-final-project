package com.campaignpro.campaign.service;

import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.campaign.entity.CampaignRecipient;
import com.campaignpro.campaign.repository.CampaignRecipientRepository;
import com.campaignpro.campaign.repository.CampaignRepository;
import com.campaignpro.common.enums.CampaignStatus;
import com.campaignpro.common.enums.EventType;
import com.campaignpro.common.enums.RecipientStatus;
import com.campaignpro.email.model.EmailSendResult;
import com.campaignpro.email.service.EmailDispatchService;
import com.campaignpro.template.service.TemplateRenderer;
import com.campaignpro.tracking.entity.EmailEvent;
import com.campaignpro.tracking.repository.EmailEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Handles the actual asynchronous bulk sending of a campaign, including
 * personalization, tracking injection (via EmailDispatchService) and retries.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CampaignDeliveryService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final EmailDispatchService emailDispatchService;
    private final EmailEventRepository emailEventRepository;

    @Value("${app.campaign.max-retries}")
    private int maxRetries;

    @Async("taskExecutor")
    @Transactional
    public void dispatchCampaignAsync(Long campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalStateException("Campaign not found: " + campaignId));

        campaign.setStatus(CampaignStatus.SENDING);
        campaignRepository.save(campaign);

        List<CampaignRecipient> recipients = recipientRepository.findByCampaignId(campaignId);
        for (CampaignRecipient recipient : recipients) {
            sendToRecipient(campaign, recipient);
        }

        campaign.setStatus(CampaignStatus.SENT);
        campaign.setSentAt(java.time.Instant.now());
        campaignRepository.save(campaign);
    }

    @Transactional
    public void retryFailedRecipients(Long campaignId) {
        List<CampaignRecipient> failed = recipientRepository
                .findByCampaignIdAndStatus(campaignId, RecipientStatus.FAILED);
        Campaign campaign = campaignRepository.findById(campaignId).orElseThrow();
        for (CampaignRecipient recipient : failed) {
            if (recipient.getRetries() < maxRetries) {
                sendToRecipient(campaign, recipient);
            }
        }
    }

    private void sendToRecipient(Campaign campaign, CampaignRecipient recipient) {
        try {
            Map<String, String> vars = Map.of(
                    "firstName", nullSafe(recipient.getContact().getFirstName(), "there"),
                    "lastName", nullSafe(recipient.getContact().getLastName(), ""),
                    "email", recipient.getContact().getEmail(),
                    "company", nullSafe(recipient.getContact().getCompany(), "")
            );
            String subject = TemplateRenderer.render(campaign.getTemplate().getSubject(), vars);
            String html = TemplateRenderer.render(campaign.getTemplate().getHtmlBody(), vars);

            EmailSendResult result = emailDispatchService.sendTracked(
                    recipient.getContact().getEmail(), subject, html, recipient.getId());

            if (result.isSuccess()) {
                recipient.setStatus(RecipientStatus.SENT);
                recipient.setProviderMessageId(result.getProviderMessageId());
                recipient.setLastError(null);
                recordEvent(campaign, recipient, EventType.SENT, null);
            } else {
                markFailed(campaign, recipient, result.getErrorMessage());
            }
        } catch (Exception ex) {
            log.error("Unexpected error sending campaign {} to recipient {}: {}",
                    campaign.getId(), recipient.getId(), ex.getMessage(), ex);
            markFailed(campaign, recipient, ex.getMessage());
        }
        recipientRepository.save(recipient);
    }

    private void markFailed(Campaign campaign, CampaignRecipient recipient, String error) {
        recipient.setStatus(RecipientStatus.FAILED);
        recipient.setRetries(recipient.getRetries() + 1);
        recipient.setLastError(error);
        recordEvent(campaign, recipient, EventType.FAILED, error);
    }

    private void recordEvent(Campaign campaign, CampaignRecipient recipient, EventType type, String metadata) {
        emailEventRepository.save(EmailEvent.builder()
                .campaign(campaign)
                .recipient(recipient)
                .type(type)
                .metadata(metadata)
                .build());
    }

    private String nullSafe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}

