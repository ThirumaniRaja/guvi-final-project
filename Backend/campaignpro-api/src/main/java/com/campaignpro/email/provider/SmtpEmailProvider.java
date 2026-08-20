package com.campaignpro.email.provider;

import com.campaignpro.email.model.EmailSendResult;
import com.campaignpro.email.model.OutboundEmail;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Default SMTP-based implementation of EmailProvider using Spring Mail / JavaMail.
 * Swap this out (or add alongside) for AWS SES / SendGrid / Mailgun by implementing
 * EmailProvider and selecting it via the "app.mail.provider" property.
 */
@Slf4j
@Component("smtpEmailProvider")
@RequiredArgsConstructor
public class SmtpEmailProvider implements EmailProvider {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Override
    public EmailSendResult send(OutboundEmail email) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(email.getToEmail());
            helper.setSubject(email.getSubject());
            helper.setText(
                    email.getTextBody() != null ? email.getTextBody() : "",
                    email.getHtmlBody() != null ? email.getHtmlBody() : ""
            );
            mailSender.send(message);
            String messageId = "smtp-" + UUID.randomUUID();
            return EmailSendResult.success(messageId);
        } catch (MailException | jakarta.mail.MessagingException e) {
            log.warn("SMTP send failed for {}: {}", email.getToEmail(), e.getMessage());
            return EmailSendResult.failure(e.getMessage());
        }
    }

    @Override
    public String providerName() {
        return "smtp";
    }
}

