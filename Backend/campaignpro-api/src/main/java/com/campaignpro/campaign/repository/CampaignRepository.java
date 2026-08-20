package com.campaignpro.campaign.repository;

import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.common.enums.CampaignStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    Page<Campaign> findByOwnerId(Long ownerId, Pageable pageable);
    Optional<Campaign> findByIdAndOwnerId(Long id, Long ownerId);
    List<Campaign> findByStatusAndScheduledAtLessThanEqual(CampaignStatus status, Instant time);
    long countByOwnerId(Long ownerId);
    long countByStatus(CampaignStatus status);
}

