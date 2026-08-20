package com.campaignpro.campaign.service;

import com.campaignpro.campaign.dto.CampaignDtos.*;
import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.campaign.entity.CampaignRecipient;
import com.campaignpro.campaign.mapper.CampaignMapper;
import com.campaignpro.campaign.repository.CampaignRecipientRepository;
import com.campaignpro.campaign.repository.CampaignRepository;
import com.campaignpro.common.audit.AuditService;
import com.campaignpro.common.enums.CampaignStatus;
import com.campaignpro.common.enums.RecipientStatus;
import com.campaignpro.common.exception.ApiException;
import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.contact.entity.Contact;
import com.campaignpro.contact.entity.ContactGroup;
import com.campaignpro.contact.repository.ContactGroupRepository;
import com.campaignpro.contact.repository.ContactRepository;
import com.campaignpro.template.entity.EmailTemplate;
import com.campaignpro.template.repository.EmailTemplateRepository;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignRecipientRepository recipientRepository;
    private final AppUserRepository appUserRepository;
    private final EmailTemplateRepository templateRepository;
    private final ContactRepository contactRepository;
    private final ContactGroupRepository contactGroupRepository;
    private final CampaignMapper campaignMapper;
    private final CampaignDeliveryService deliveryService;
    private final AuditService auditService;

    @Transactional
    public CampaignResponse create(String ownerEmail, CreateCampaignRequest req) {
        AppUser owner = getOwner(ownerEmail);
        EmailTemplate template = templateRepository.findByIdAndOwnerId(req.templateId(), owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        Campaign campaign = Campaign.builder()
                .owner(owner)
                .template(template)
                .name(req.name())
                .status(CampaignStatus.DRAFT)
                .build();
        campaignRepository.save(campaign);

        Set<Contact> recipientContacts = resolveRecipients(owner.getId(), req.contactIds(), req.groupIds());
        for (Contact contact : recipientContacts) {
            recipientRepository.save(CampaignRecipient.builder()
                    .campaign(campaign)
                    .contact(contact)
                    .status(RecipientStatus.PENDING)
                    .build());
        }

        auditService.record(owner.getId(), "CAMPAIGN_CREATED", "CAMPAIGN", String.valueOf(campaign.getId()), null);
        return toResponse(campaign);
    }

    @Transactional(readOnly = true)
    public PageResponse<CampaignResponse> list(String ownerEmail, Pageable pageable) {
        AppUser owner = getOwner(ownerEmail);
        return PageResponse.from(campaignRepository.findByOwnerId(owner.getId(), pageable).map(this::toResponse));
    }

    @Transactional(readOnly = true)
    public CampaignResponse getOne(String ownerEmail, Long campaignId) {
        return toResponse(findOwned(ownerEmail, campaignId));
    }

    @Transactional(readOnly = true)
    public List<RecipientResponse> recipients(String ownerEmail, Long campaignId) {
        Campaign campaign = findOwned(ownerEmail, campaignId);
        return recipientRepository.findByCampaignId(campaign.getId()).stream()
                .map(campaignMapper::toRecipientResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampaignResponse update(String ownerEmail, Long campaignId, UpdateCampaignRequest req) {
        Campaign campaign = findOwned(ownerEmail, campaignId);
        requireDraft(campaign);
        AppUser owner = getOwner(ownerEmail);
        EmailTemplate template = templateRepository.findByIdAndOwnerId(req.templateId(), owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        campaign.setName(req.name());
        campaign.setTemplate(template);
        campaignRepository.save(campaign);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse schedule(String ownerEmail, Long campaignId, ScheduleCampaignRequest req) {
        Campaign campaign = findOwned(ownerEmail, campaignId);
        requireDraft(campaign);
        campaign.setStatus(CampaignStatus.SCHEDULED);
        campaign.setScheduledAt(req.scheduledAt());
        campaignRepository.save(campaign);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse cancel(String ownerEmail, Long campaignId) {
        Campaign campaign = findOwned(ownerEmail, campaignId);
        if (campaign.getStatus() != CampaignStatus.SCHEDULED && campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new ApiException("Only draft or scheduled campaigns can be cancelled");
        }
        campaign.setStatus(CampaignStatus.CANCELLED);
        campaignRepository.save(campaign);
        return toResponse(campaign);
    }

    @Transactional
    public CampaignResponse sendNow(String ownerEmail, Long campaignId) {
        Campaign campaign = findOwned(ownerEmail, campaignId);
        if (campaign.getStatus() != CampaignStatus.DRAFT && campaign.getStatus() != CampaignStatus.SCHEDULED) {
            throw new ApiException("Campaign cannot be sent from its current status: " + campaign.getStatus());
        }
        deliveryService.dispatchCampaignAsync(campaign.getId());
        return toResponse(campaign);
    }

    private Set<Contact> resolveRecipients(Long ownerId, List<Long> contactIds, List<Long> groupIds) {
        Set<Contact> result = new HashSet<>();
        if (contactIds != null && !contactIds.isEmpty()) {
            result.addAll(contactRepository.findByOwnerIdAndIdIn(ownerId, contactIds));
        }
        if (groupIds != null) {
            for (Long groupId : groupIds) {
                ContactGroup group = contactGroupRepository.findByIdAndOwnerId(groupId, ownerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Contact group not found: " + groupId));
                result.addAll(group.getMembers());
            }
        }
        if (result.isEmpty()) {
            throw new ApiException("Campaign must have at least one recipient");
        }
        return result;
    }

    private void requireDraft(Campaign campaign) {
        if (campaign.getStatus() != CampaignStatus.DRAFT) {
            throw new ApiException("Only draft campaigns can be modified");
        }
    }

    private CampaignResponse toResponse(Campaign campaign) {
        long count = recipientRepository.findByCampaignId(campaign.getId()).size();
        return campaignMapper.toResponse(campaign, count);
    }

    private Campaign findOwned(String ownerEmail, Long campaignId) {
        AppUser owner = getOwner(ownerEmail);
        return campaignRepository.findByIdAndOwnerId(campaignId, owner.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Campaign not found"));
    }

    private AppUser getOwner(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

