package com.campaignpro.contact.repository;

import com.campaignpro.contact.entity.ContactGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactGroupRepository extends JpaRepository<ContactGroup, Long> {
    List<ContactGroup> findByOwnerId(Long ownerId);
    Optional<ContactGroup> findByIdAndOwnerId(Long id, Long ownerId);
}

