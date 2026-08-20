package com.campaignpro.common.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final String errorCode;

    public ApiException(String message) {
        this(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message);
    }

    public ApiException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public HttpStatus getStatus() { return status; }
    public String getErrorCode() { return errorCode; }
}

