package com.campaignpro.contact.service;

import com.campaignpro.common.exception.DuplicateResourceException;
import com.campaignpro.common.exception.ResourceNotFoundException;
import com.campaignpro.common.response.PageResponse;
import com.campaignpro.contact.dto.ContactDtos.*;
import com.campaignpro.contact.entity.Contact;
import com.campaignpro.contact.mapper.ContactMapper;
import com.campaignpro.contact.repository.ContactRepository;
import com.campaignpro.user.entity.AppUser;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final AppUserRepository appUserRepository;
    private final ContactMapper contactMapper;

    @Transactional
    public ContactResponse create(String ownerEmail, ContactRequest req) {
        AppUser owner = getOwner(ownerEmail);
        String email = req.email().toLowerCase();
        if (contactRepository.existsByOwnerIdAndEmail(owner.getId(), email)) {
            throw new DuplicateResourceException("Contact with this email already exists");
        }
        Contact contact = Contact.builder()
                .owner(owner)
                .email(email)
                .firstName(req.firstName())
                .lastName(req.lastName())
                .company(req.company())
                .phone(req.phone())
                .build();
        contactRepository.save(contact);
        return contactMapper.toResponse(contact);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> search(String ownerEmail, String query, Pageable pageable) {
        AppUser owner = getOwner(ownerEmail);
        var page = (query == null || query.isBlank())
                ? contactRepository.findByOwnerId(owner.getId(), pageable)
                : contactRepository.findByOwnerIdAndEmailContainingIgnoreCaseOrOwnerIdAndFirstNameContainingIgnoreCase(
                        owner.getId(), query, owner.getId(), query, pageable);
        return PageResponse.from(page.map(contactMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public ContactResponse getOne(String ownerEmail, Long contactId) {
        AppUser owner = getOwner(ownerEmail);
        return contactMapper.toResponse(findOwned(owner.getId(), contactId));
    }

    @Transactional
    public ContactResponse update(String ownerEmail, Long contactId, ContactRequest req) {
        AppUser owner = getOwner(ownerEmail);
        Contact contact = findOwned(owner.getId(), contactId);
        contact.setEmail(req.email().toLowerCase());
        contact.setFirstName(req.firstName());
        contact.setLastName(req.lastName());
        contact.setCompany(req.company());
        contact.setPhone(req.phone());
        contactRepository.save(contact);
        return contactMapper.toResponse(contact);
    }

    @Transactional
    public void delete(String ownerEmail, Long contactId) {
        AppUser owner = getOwner(ownerEmail);
        Contact contact = findOwned(owner.getId(), contactId);
        contactRepository.delete(contact);
    }

    List<Contact> findByIds(Long ownerId, List<Long> ids) {
        return contactRepository.findByOwnerIdAndIdIn(ownerId, ids);
    }

    private Contact findOwned(Long ownerId, Long contactId) {
        return contactRepository.findByIdAndOwnerId(contactId, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found"));
    }

    private AppUser getOwner(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}

