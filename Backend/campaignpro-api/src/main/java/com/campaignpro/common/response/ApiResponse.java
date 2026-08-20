package com.campaignpro.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String errorCode;
    private String message;
    private T data;
    private Instant timestamp;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, null, null, data, Instant.now());
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, null, message, data, Instant.now());
    }

    public static ApiResponse<Void> error(String errorCode, String message) {
        return new ApiResponse<>(false, errorCode, message, null, Instant.now());
    }

    public static <T> ApiResponse<T> errorWithData(String errorCode, String message, T data) {
        return new ApiResponse<>(false, errorCode, message, data, Instant.now());
    }
}

