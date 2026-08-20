package com.campaignpro.analytics.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campaignpro.campaign.entity.Campaign;

/**
 * Repository dedicated to aggregate analytics queries spanning
 * campaigns and recipients, kept separate from operational repositories.
 */
public interface AnalyticsRepository extends JpaRepository<Campaign, Long> {

    @Query("select count(c) from Campaign c where c.owner.id = :ownerId")
    long countCampaignsForOwner(@Param("ownerId") Long ownerId);
}

