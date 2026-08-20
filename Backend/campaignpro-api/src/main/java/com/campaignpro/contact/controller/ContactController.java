package com.campaignpro.contact.controller;

import com.campaignpro.common.response.ApiResponse;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.contact.dto.ContactDtos.*;
import com.campaignpro.contact.service.ContactService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@Tag(name = "Contacts")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ContactResponse> create(@Valid @RequestBody ContactRequest request, Authentication auth) {
        return ApiResponse.ok("Contact created", contactService.create(auth.getName(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<ContactResponse>> search(@RequestParam(required = false) String query,
                                                              Pageable pageable, Authentication auth) {
        return ApiResponse.ok(contactService.search(auth.getName(), query, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<ContactResponse> get(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(contactService.getOne(auth.getName(), id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ContactResponse> update(@PathVariable Long id, @Valid @RequestBody ContactRequest request,
                                                Authentication auth) {
        return ApiResponse.ok("Contact updated", contactService.update(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, Authentication auth) {
        contactService.delete(auth.getName(), id);
        return ApiResponse.ok("Contact deleted", null);
    }
}

