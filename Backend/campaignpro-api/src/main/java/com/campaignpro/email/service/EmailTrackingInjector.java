package com.campaignpro.email.service;

import com.campaignpro.common.util.HmacSigner;
import com.campaignpro.common.util.TokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Injects an open-tracking pixel and rewrites <a href="..."> links
 * to go through the click-tracking redirect endpoint.
 */
@Component
public class EmailTrackingInjector {

    private static final Pattern HREF_PATTERN = Pattern.compile("href=\"(http[^\"]+)\"");

    @Value("${app.tracking.base-url}")
    private String trackingBaseUrl;

    @Value("${app.tracking.token-secret}")
    private String tokenSecret;

    public String injectTracking(String html, Long recipientId) {
        if (html == null) return "";
        String token = signedToken(recipientId);

        String withClickTracking = rewriteLinks(html, token);
        String pixelTag = "<img src=\"" + trackingBaseUrl + "/api/v1/tracking/open/" + token
                + ".png\" width=\"1\" height=\"1\" style=\"display:none\" alt=\"\"/>";
        return withClickTracking + pixelTag;
    }

    private String rewriteLinks(String html, String token) {
        Matcher matcher = HREF_PATTERN.matcher(html);
        StringBuilder result = new StringBuilder();
        while (matcher.find()) {
            String originalUrl = matcher.group(1);
            String encoded = URLEncoder.encode(originalUrl, StandardCharsets.UTF_8);
            String replacement = "href=\"" + trackingBaseUrl + "/api/v1/tracking/click/" + token + "?u=" + encoded + "\"";
            matcher.appendReplacement(result, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private String signedToken(Long recipientId) {
        String payload = TokenUtil.encode(recipientId);
        String signature = HmacSigner.sign(payload, tokenSecret);
        return payload + "." + signature;
    }

    public Long verifyAndExtractRecipientId(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Malformed tracking token");
        }
        if (!HmacSigner.verify(parts[0], parts[1], tokenSecret)) {
            throw new IllegalArgumentException("Invalid tracking token signature");
        }
        return TokenUtil.decode(parts[0]);
    }
}

