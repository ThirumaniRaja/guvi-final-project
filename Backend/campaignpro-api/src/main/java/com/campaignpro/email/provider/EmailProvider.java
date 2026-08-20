package com.campaignpro.email.provider;

import com.campaignpro.email.model.EmailSendResult;
import com.campaignpro.email.model.OutboundEmail;

/**
 * Abstraction over the underlying email delivery mechanism.
 * Implementations: SMTP (default), and can be extended for
 * AWS SES, SendGrid, Mailgun, etc. without touching business logic.
 */
public interface EmailProvider {
    EmailSendResult send(OutboundEmail email);

    /** Unique identifier of this provider, e.g. "smtp", "ses", "sendgrid". */
    String providerName();
}

