package com.campaignpro.contact.dto;

import com.campaignpro.common.enums.ContactStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.time.Instant;
import java.util.List;

public class ContactDtos {

    public record ContactRequest(
            @Email @NotBlank String email,
            String firstName,
            String lastName,
            String company,
            String phone
    ) {}

    public record ContactResponse(
            Long id,
            String email,
            String firstName,
            String lastName,
            String company,
            String phone,
            ContactStatus status,
            Instant createdAt
    ) {}

    public record ContactGroupRequest(
            @NotBlank String name,
            String description
    ) {}

    public record ContactGroupResponse(
            Long id,
            String name,
            String description,
            int memberCount,
            Instant createdAt
    ) {}

    public record AddMembersRequest(@NotEmpty List<Long> contactIds) {}
}

