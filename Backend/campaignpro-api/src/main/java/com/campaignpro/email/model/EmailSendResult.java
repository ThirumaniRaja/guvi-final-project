package com.campaignpro.email.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmailSendResult {
    private boolean success;
    private String providerMessageId;
    private String errorMessage;

    public static EmailSendResult success(String providerMessageId) {
        return new EmailSendResult(true, providerMessageId, null);
    }

    public static EmailSendResult failure(String errorMessage) {
        return new EmailSendResult(false, null, errorMessage);
    }
}

