package com.campaignpro.tracking.repository;

import com.campaignpro.common.enums.EventType;
import com.campaignpro.tracking.entity.EmailEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface EmailEventRepository extends JpaRepository<EmailEvent, Long> {

    long countByCampaignIdAndType(Long campaignId, EventType type);

    long countByType(EventType type);

    @Query("select e.type as type, count(e) as total from EmailEvent e " +
           "where e.campaign.id = :campaignId group by e.type")
    List<Object[]> countsByTypeForCampaign(@Param("campaignId") Long campaignId);

    @Query("select date_trunc('day', e.createdAt) as day, e.type as type, count(e) as total " +
           "from EmailEvent e where e.campaign.owner.id = :ownerId and e.createdAt between :from and :to " +
           "group by day, e.type order by day")
    List<Object[]> dailyBreakdownForOwner(@Param("ownerId") Long ownerId,
                                          @Param("from") Instant from,
                                          @Param("to") Instant to);
}

