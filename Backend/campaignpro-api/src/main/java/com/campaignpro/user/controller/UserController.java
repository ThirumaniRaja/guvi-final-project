package com.campaignpro.user.controller;

import com.campaignpro.common.response.ApiResponse;
import com.campaignpro.user.dto.UserDtos.*;
import com.campaignpro.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserResponse> me(Authentication authentication) {
        return ApiResponse.ok(userService.getByEmail(authentication.getName()));
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                    Authentication authentication) {
        return ApiResponse.ok("Profile updated", userService.updateProfile(authentication.getName(), request));
    }

    @PostMapping("/me/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                             Authentication authentication) {
        userService.changePassword(authentication.getName(), request);
        return ApiResponse.ok("Password changed successfully", null);
    }
}

