package com.campaignpro.user.service;

import com.campaignpro.common.enums.Role;
import com.campaignpro.common.enums.UserStatus;
import com.campaignpro.common.exception.DuplicateResourceException;
import com.campaignpro.common.exception.InvalidCredentialsException;
import com.campaignpro.security.JwtService;
import com.campaignpro.user.dto.UserDtos.*;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.mapper.UserMapper;
import com.campaignpro.user.repository.AppUserRepository;
import com.campaignpro.user.repository.RefreshTokenRepository;
import com.campaignpro.common.audit.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AppUserRepository appUserRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private UserMapper userMapper;
    @Mock private AuditService auditService;

    private PasswordEncoder passwordEncoder;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        authService = new AuthService(appUserRepository, refreshTokenRepository, passwordEncoder,
                jwtService, userMapper, auditService);
    }

    @Test
    void register_throwsWhenEmailAlreadyExists() {
        when(appUserRepository.existsByEmail("john@example.com")).thenReturn(true);

        RegisterRequest req = new RegisterRequest("john@example.com", "password123", "John Doe", "Acme");

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void register_savesUserWithHashedPassword() {
        when(appUserRepository.existsByEmail(anyString())).thenReturn(false);
        when(jwtService.generateAccessToken(anyString(), any(), anyString())).thenReturn("access-token");
        when(jwtService.newRefreshTokenRaw()).thenReturn("refresh-token");
        when(jwtService.refreshTokenExpirationDays()).thenReturn(7L);
        when(userMapper.toResponse(any(AppUser.class))).thenReturn(
                new UserResponse(1L, "john@example.com", "John Doe", "Acme", "UTC", Role.USER, UserStatus.ACTIVE, null));

        RegisterRequest req = new RegisterRequest("john@example.com", "password123", "John Doe", "Acme");
        AuthResponse response = authService.register(req);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        verify(appUserRepository).save(any(AppUser.class));
    }

    @Test
    void login_throwsOnWrongPassword() {
        AppUser user = AppUser.builder()
                .id(1L)
                .email("john@example.com")
                .passwordHash(passwordEncoder.encode("correct-password"))
                .fullName("John Doe")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();
        when(appUserRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        LoginRequest req = new LoginRequest("john@example.com", "wrong-password");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}

