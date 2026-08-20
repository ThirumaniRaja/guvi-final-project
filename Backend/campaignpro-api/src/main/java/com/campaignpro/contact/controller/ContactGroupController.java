package com.campaignpro.contact.controller;

import com.campaignpro.common.response.ApiResponse;
import com.campaignpro.contact.dto.ContactDtos.*;
import com.campaignpro.contact.service.ContactGroupService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contact-groups")
@RequiredArgsConstructor
@Tag(name = "Contact Groups")
public class ContactGroupController {

    private final ContactGroupService groupService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ContactGroupResponse> create(@Valid @RequestBody ContactGroupRequest request, Authentication auth) {
        return ApiResponse.ok("Group created", groupService.create(auth.getName(), request));
    }

    @GetMapping
    public ApiResponse<List<ContactGroupResponse>> list(Authentication auth) {
        return ApiResponse.ok(groupService.list(auth.getName()));
    }

    @PostMapping("/{id}/members")
    public ApiResponse<ContactGroupResponse> addMembers(@PathVariable Long id,
                                                         @Valid @RequestBody AddMembersRequest request,
                                                         Authentication auth) {
        return ApiResponse.ok("Members added", groupService.addMembers(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}/members/{contactId}")
    public ApiResponse<Void> removeMember(@PathVariable Long id, @PathVariable Long contactId, Authentication auth) {
        groupService.removeMember(auth.getName(), id, contactId);
        return ApiResponse.ok("Member removed", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, Authentication auth) {
        groupService.delete(auth.getName(), id);
        return ApiResponse.ok("Group deleted", null);
    }
}

