package com.campaignpro.user.dto;

import com.campaignpro.common.enums.Role;
import com.campaignpro.common.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class UserDtos {

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8, max = 100) String password,
            @NotBlank String fullName,
            String organization
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            String tokenType,
            UserResponse user
    ) {}

    public record UpdateProfileRequest(
            @NotBlank String fullName,
            String organization,
            String timezone
    ) {}

    public record ChangePasswordRequest(
            @NotBlank String currentPassword,
            @NotBlank @Size(min = 8, max = 100) String newPassword
    ) {}

    public record UserResponse(
            Long id,
            String email,
            String fullName,
            String organization,
            String timezone,
            Role role,
            UserStatus status,
            Instant createdAt
    ) {}

    public record UpdateUserStatusRequest(@NotBlank String status) {}
}

