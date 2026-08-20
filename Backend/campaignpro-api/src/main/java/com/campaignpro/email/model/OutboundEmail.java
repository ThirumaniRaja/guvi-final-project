package com.campaignpro.email.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OutboundEmail {
    private String toEmail;
    private String subject;
    private String htmlBody;
    private String textBody;
    private String trackingId;
}

