package com.campaignpro.contact.service;

import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.contact.dto.ContactDtos.*;
import com.campaignpro.contact.entity.Contact;
import com.campaignpro.contact.entity.ContactGroup;
import com.campaignpro.contact.mapper.ContactMapper;
import com.campaignpro.contact.repository.ContactGroupRepository;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactGroupService {

    private final ContactGroupRepository contactGroupRepository;
    private final AppUserRepository appUserRepository;
    private final ContactMapper contactMapper;
    private final ContactService contactService;

    @Transactional
    public ContactGroupResponse create(String ownerEmail, ContactGroupRequest req) {
        AppUser owner = getOwner(ownerEmail);
        ContactGroup group = ContactGroup.builder()
                .owner(owner)
                .name(req.name())
                .description(req.description())
                .build();
        contactGroupRepository.save(group);
        return contactMapper.toGroupResponse(group);
    }

    @Transactional(readOnly = true)
    public List<ContactGroupResponse> list(String ownerEmail) {
        AppUser owner = getOwner(ownerEmail);
        return contactGroupRepository.findByOwnerId(owner.getId()).stream()
                .map(contactMapper::toGroupResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ContactGroupResponse addMembers(String ownerEmail, Long groupId, AddMembersRequest req) {
        AppUser owner = getOwner(ownerEmail);
        ContactGroup group = findOwned(owner.getId(), groupId);
        List<Contact> contacts = contactService.findByIds(owner.getId(), req.contactIds());
        group.getMembers().addAll(contacts);
        contactGroupRepository.save(group);
        return contactMapper.toGroupResponse(group);
    }

    @Transactional
    public void removeMember(String ownerEmail, Long groupId, Long contactId) {
        AppUser owner = getOwner(ownerEmail);
        ContactGroup group = findOwned(owner.getId(), groupId);
        group.getMembers().removeIf(c -> c.getId().equals(contactId));
        contactGroupRepository.save(group);
    }

    @Transactional
    public void delete(String ownerEmail, Long groupId) {
        AppUser owner = getOwner(ownerEmail);
        contactGroupRepository.delete(findOwned(owner.getId(), groupId));
    }

    private ContactGroup findOwned(Long ownerId, Long groupId) {
        return contactGroupRepository.findByIdAndOwnerId(groupId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact group not found"));
    }

    private AppUser getOwner(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

