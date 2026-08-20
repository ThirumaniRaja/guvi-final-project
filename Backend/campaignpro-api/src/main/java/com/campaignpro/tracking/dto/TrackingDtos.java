package com.campaignpro.tracking.dto;

public class TrackingDtos {
    public record EventRecordRequest(Long recipientId, String url) {}
}

