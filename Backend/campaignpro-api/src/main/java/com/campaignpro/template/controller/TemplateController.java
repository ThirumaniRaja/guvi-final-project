package com.campaignpro.template.controller;

import com.campaignpro.common.response.ApiResponse;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.template.dto.TemplateDtos.*;
import com.campaignpro.template.service.TemplateService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@Tag(name = "Email Templates")
public class TemplateController {

    private final TemplateService templateService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TemplateResponse> create(@Valid @RequestBody TemplateRequest request, Authentication auth) {
        return ApiResponse.ok("Template created", templateService.create(auth.getName(), request));
    }

    @GetMapping
    public ApiResponse<PageResponse<TemplateResponse>> list(Pageable pageable, Authentication auth) {
        return ApiResponse.ok(templateService.list(auth.getName(), pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<TemplateResponse> get(@PathVariable Long id, Authentication auth) {
        return ApiResponse.ok(templateService.getOne(auth.getName(), id));
    }

    @PutMapping("/{id}")
    public ApiResponse<TemplateResponse> update(@PathVariable Long id, @Valid @RequestBody TemplateRequest request,
                                                 Authentication auth) {
        return ApiResponse.ok("Template updated", templateService.update(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, Authentication auth) {
        templateService.delete(auth.getName(), id);
        return ApiResponse.ok("Template deleted", null);
    }

    @PostMapping("/{id}/preview")
    public ApiResponse<PreviewResponse> preview(@PathVariable Long id, @RequestBody PreviewRequest request,
                                                 Authentication auth) {
        return ApiResponse.ok(templateService.preview(auth.getName(), id, request));
    }
}

