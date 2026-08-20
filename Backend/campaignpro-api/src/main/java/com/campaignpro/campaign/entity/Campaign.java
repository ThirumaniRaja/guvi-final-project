package com.campaignpro.campaign.entity;

import com.campaignpro.common.enums.CampaignStatus;
import com.campaignpro.template.entity.EmailTemplate;
import com.campaignpro.user.entity.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "campaigns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private EmailTemplate template;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CampaignStatus status = CampaignStatus.DRAFT;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }
}

