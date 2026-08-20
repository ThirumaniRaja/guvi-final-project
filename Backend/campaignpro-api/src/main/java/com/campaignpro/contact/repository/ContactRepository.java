package com.campaignpro.contact.repository;

import com.campaignpro.contact.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContactRepository extends JpaRepository<Contact, Long> {
    Page<Contact> findByOwnerId(Long ownerId, Pageable pageable);

    Page<Contact> findByOwnerIdAndEmailContainingIgnoreCaseOrOwnerIdAndFirstNameContainingIgnoreCase(
            Long ownerId1, String email, Long ownerId2, String firstName, Pageable pageable);

    Optional<Contact> findByIdAndOwnerId(Long id, Long ownerId);

    boolean existsByOwnerIdAndEmail(Long ownerId, String email);

    List<Contact> findByOwnerIdAndIdIn(Long ownerId, List<Long> ids);

    long countByOwnerId(Long ownerId);
}

