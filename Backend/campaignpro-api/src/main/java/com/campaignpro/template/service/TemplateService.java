package com.campaignpro.template.service;

import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.template.dto.TemplateDtos.*;
import com.campaignpro.template.entity.EmailTemplate;
import com.campaignpro.template.mapper.TemplateMapper;
import com.campaignpro.template.repository.EmailTemplateRepository;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final EmailTemplateRepository templateRepository;
    private final AppUserRepository appUserRepository;
    private final TemplateMapper templateMapper;

    @Transactional
    public TemplateResponse create(String ownerEmail, TemplateRequest req) {
        AppUser owner = getOwner(ownerEmail);
        EmailTemplate template = EmailTemplate.builder()
                .owner(owner)
                .name(req.name())
                .subject(req.subject())
                .htmlBody(req.htmlBody())
                .textBody(req.textBody())
                .build();
        templateRepository.save(template);
        return templateMapper.toResponse(template);
    }

    @Transactional(readOnly = true)
    public PageResponse<TemplateResponse> list(String ownerEmail, Pageable pageable) {
        AppUser owner = getOwner(ownerEmail);
        return PageResponse.from(templateRepository.findByOwnerId(owner.getId(), pageable)
                .map(templateMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public TemplateResponse getOne(String ownerEmail, Long id) {
        return templateMapper.toResponse(findOwned(ownerEmail, id));
    }

    @Transactional
    public TemplateResponse update(String ownerEmail, Long id, TemplateRequest req) {
        EmailTemplate template = findOwned(ownerEmail, id);
        template.setName(req.name());
        template.setSubject(req.subject());
        template.setHtmlBody(req.htmlBody());
        template.setTextBody(req.textBody());
        templateRepository.save(template);
        return templateMapper.toResponse(template);
    }

    @Transactional
    public void delete(String ownerEmail, Long id) {
        templateRepository.delete(findOwned(ownerEmail, id));
    }

    @Transactional(readOnly = true)
    public PreviewResponse preview(String ownerEmail, Long id, PreviewRequest req) {
        EmailTemplate template = findOwned(ownerEmail, id);
        String html = TemplateRenderer.render(template.getHtmlBody(), req.variables());
        String subject = TemplateRenderer.render(template.getSubject(), req.variables());
        return new PreviewResponse(subject, html);
    }

    EmailTemplate findOwned(String ownerEmail, Long id) {
        AppUser owner = getOwner(ownerEmail);
        return templateRepository.findByIdAndOwnerId(id, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
    }

    private AppUser getOwner(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

