package com.campaignpro.email.service;

import com.campaignpro.email.model.EmailSendResult;
import com.campaignpro.email.model.OutboundEmail;
import com.campaignpro.email.provider.EmailProviderResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailDispatchService {

    private final EmailProviderResolver providerResolver;
    private final EmailTrackingInjector trackingInjector;

    public EmailSendResult sendTracked(String toEmail, String subject, String html, Long recipientId) {
        String trackedHtml = trackingInjector.injectTracking(html, recipientId);
        OutboundEmail email = OutboundEmail.builder()
                .toEmail(toEmail)
                .subject(subject)
                .htmlBody(trackedHtml)
                .trackingId(String.valueOf(recipientId))
                .build();
        return providerResolver.resolve().send(email);
    }
}

