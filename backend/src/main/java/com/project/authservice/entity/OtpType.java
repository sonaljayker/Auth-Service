package com.project.authservice.entity;

public enum OtpType {
    LOGIN,
    PASSWORD_RESET,
    TWO_FACTOR,
    REGISTRATION,
    EMAIL_VERIFICATION;

    public static OtpType fromString(String type) {
        if (type == null || type.isBlank()) {
            return LOGIN;
        }
        String normalized = type.trim().toUpperCase().replace("-", "_").replace(" ", "_");
        if ("REGISTER".equals(normalized)) {
            return REGISTRATION;
        }
        for (OtpType otpType : values()) {
            if (otpType.name().equals(normalized)) {
                return otpType;
            }
        }
        return LOGIN;
    }
}
