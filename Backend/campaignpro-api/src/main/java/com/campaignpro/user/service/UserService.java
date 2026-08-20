package com.campaignpro.user.service;

import com.campaignpro.common.exception.InvalidCredentialsException;
import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.user.dto.UserDtos.*;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.mapper.UserMapper;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final AppUserRepository appUserRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return userMapper.toResponse(findUser(email));
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest req) {
        AppUser user = findUser(email);
        user.setFullName(req.fullName());
        user.setOrganization(req.organization());
        if (req.timezone() != null) {
            user.setTimezone(req.timezone());
        }
        appUserRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest req) {
        AppUser user = findUser(email);
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        appUserRepository.save(user);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(String query, Pageable pageable) {
        String q = query == null ? "" : query;
        var page = appUserRepository
                .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable)
                .map(userMapper::toResponse);
        return PageResponse.from(page);
    }

    @Transactional
    public UserResponse updateStatus(Long userId, UpdateUserStatusRequest req) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(com.campaignpro.common.enums.UserStatus.valueOf(req.status().toUpperCase()));
        appUserRepository.save(user);
        return userMapper.toResponse(user);
    }

    private AppUser findUser(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

