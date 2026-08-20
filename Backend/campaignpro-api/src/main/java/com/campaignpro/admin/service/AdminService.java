package com.campaignpro.admin.service;

import com.campaignpro.admin.dto.AdminDtos.*;
import com.campaignpro.analytics.service.AnalyticsService;
import com.campaignpro.campaign.repository.CampaignRepository;
import com.campaignpro.common.audit.AuditLogRepository;
import com.campaignpro.common.enums.UserStatus;
import com.campaignpro.user.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AppUserRepository appUserRepository;
    private final CampaignRepository campaignRepository;
    private final AuditLogRepository auditLogRepository;
    private final AnalyticsService analyticsService;

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        long totalUsers = appUserRepository.count();
        long activeUsers = appUserRepository.findAll().stream()
                .filter(u -> u.getStatus() == UserStatus.ACTIVE)
                .count();
        long totalCampaigns = campaignRepository.count();

        return new AdminDashboardResponse(
                totalUsers, activeUsers, totalCampaigns, analyticsService.globalOverview()
        );
    }

    @Transactional(readOnly = true)
    public AdminActivityResponse recentActivity() {
        var logs = auditLogRepository.findAll(PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<RecentAuditEntry> entries = logs.getContent().stream()
                .map(log -> new RecentAuditEntry(
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getCreatedAt().toString()
                ))
                .toList();
        return new AdminActivityResponse(entries);
    }
}

