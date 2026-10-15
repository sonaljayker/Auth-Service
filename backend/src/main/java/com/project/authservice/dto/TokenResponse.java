package com.project.authservice.dto;

public record TokenResponse(String accessToken, String refreshToken,
                            long expireIn,
                            String tokenType,
                            UserDto user) {

    public static TokenResponse bearer(String accessToken, String refreshToken, long expireIn, String tokenType, UserDto user) {
        return new TokenResponse(accessToken, refreshToken, expireIn, tokenType, user);
    }

}
