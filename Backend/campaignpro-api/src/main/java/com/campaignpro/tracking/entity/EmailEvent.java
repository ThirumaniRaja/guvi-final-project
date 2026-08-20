package com.campaignpro.tracking.entity;

import com.campaignpro.campaign.entity.Campaign;
import com.campaignpro.campaign.entity.CampaignRecipient;
import com.campaignpro.common.enums.EventType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "email_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id")
    private CampaignRecipient recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType type;

    @Column(length = 2000)
    private String metadata;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}

