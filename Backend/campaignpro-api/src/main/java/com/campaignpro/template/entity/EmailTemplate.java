package com.campaignpro.template.entity;

import com.campaignpro.user.entity.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "email_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUser owner;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String subject;

    @Column(name = "html_body", nullable = false, columnDefinition = "text")
    private String htmlBody;

    @Column(name = "text_body", columnDefinition = "text")
    private String textBody;

    @Builder.Default
    private int version = 1;

    @Builder.Default
    private boolean active = true;

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
        version += 1;
    }
}

