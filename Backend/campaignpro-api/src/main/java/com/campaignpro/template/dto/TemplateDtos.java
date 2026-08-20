package com.campaignpro.template.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.Map;

public class TemplateDtos {

    public record TemplateRequest(
            @NotBlank String name,
            @NotBlank String subject,
            @NotBlank String htmlBody,
            String textBody
    ) {}

    public record TemplateResponse(
            Long id,
            String name,
            String subject,
            String htmlBody,
            String textBody,
            int version,
            boolean active,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record PreviewRequest(Map<String, String> variables) {}

    public record PreviewResponse(String subject, String html) {}
}

