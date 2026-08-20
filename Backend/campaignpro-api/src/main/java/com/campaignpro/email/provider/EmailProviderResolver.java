package com.campaignpro.email.provider;

import com.campaignpro.common.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Resolves the active EmailProvider bean based on configuration
 * (app.mail.provider=smtp|ses|sendgrid|mailgun ...).
 * To add a new provider: implement EmailProvider, annotate with
 * @Component("<name>EmailProvider"), no other code changes needed.
 */
@Component
public class EmailProviderResolver {

    private final Map<String, EmailProvider> providersByName;
    private final String activeProviderKey;

    public EmailProviderResolver(List<EmailProvider> providers,
                                  @Value("${app.mail.provider}") String activeProviderKey) {
        this.providersByName = providers.stream()
                .collect(Collectors.toMap(EmailProvider::providerName, p -> p));
        this.activeProviderKey = activeProviderKey;
    }

    public EmailProvider resolve() {
        EmailProvider provider = providersByName.get(activeProviderKey);
        if (provider == null) {
            throw new ApiException("No email provider configured for key: " + activeProviderKey);
        }
        return provider;
    }
}

