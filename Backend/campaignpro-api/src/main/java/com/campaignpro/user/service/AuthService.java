package com.campaignpro.user.service;

import com.campaignpro.common.audit.AuditService;
import com.campaignpro.common.enums.Role;
import com.campaignpro.common.enums.UserStatus;
import com.campaignpro.common.exception.DuplicateResourceException;
import com.campaignpro.common.exception.InvalidCredentialsException;
import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.security.JwtService;
import com.campaignpro.user.dto.UserDtos.*;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.entity.RefreshToken;
import com.campaignpro.user.mapper.UserMapper;
import com.campaignpro.user.repository.AppUserRepository;
import com.campaignpro.user.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (appUserRepository.existsByEmail(req.email().toLowerCase())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        AppUser user = AppUser.builder()
                .email(req.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(req.password()))
                .fullName(req.fullName())
                .organization(req.organization())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();
        appUserRepository.save(user);
        auditService.record(user.getId(), "USER_REGISTERED", "USER", String.valueOf(user.getId()), null);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        AppUser user = appUserRepository.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new InvalidCredentialsException("Account is not active");
        }
        auditService.record(user.getId(), "USER_LOGIN", "USER", String.valueOf(user.getId()), null);
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        String hash = sha256(req.refreshToken());
        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidCredentialsException("Refresh token expired or revoked");
        }
        stored.setRevoked(true);
        refreshTokenRepository.save(stored);

        AppUser user = stored.getUser();
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId(), user.getRole().name());
        String rawRefreshToken = jwtService.newRefreshTokenRaw();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(sha256(rawRefreshToken))
                .expiresAt(Instant.now().plusSeconds(jwtService.refreshTokenExpirationDays() * 86400))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(accessToken, rawRefreshToken, "Bearer", userMapper.toResponse(user));
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}

