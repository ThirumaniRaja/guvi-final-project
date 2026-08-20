package com.campaignpro.admin.controller;

import com.campaignpro.admin.dto.AdminDtos.*;
import com.campaignpro.admin.service.AdminService;
import com.campaignpro.common.response.ApiResponse;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.user.dto.UserDtos.UpdateUserStatusRequest;
import com.campaignpro.user.dto.UserDtos.UserResponse;
import com.campaignpro.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardResponse> dashboard() {
        return ApiResponse.ok(adminService.dashboard());
    }

    @GetMapping("/activity")
    public ApiResponse<AdminActivityResponse> activity() {
        return ApiResponse.ok(adminService.recentActivity());
    }

    @GetMapping("/users")
    public ApiResponse<PageResponse<UserResponse>> users(@RequestParam(required = false) String query,
                                                          Pageable pageable) {
        return ApiResponse.ok(userService.searchUsers(query, pageable));
    }

    @PatchMapping("/users/{id}/status")
    public ApiResponse<UserResponse> updateStatus(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateUserStatusRequest request) {
        return ApiResponse.ok("User status updated", userService.updateStatus(id, request));
    }
}

