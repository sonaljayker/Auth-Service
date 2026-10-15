package com.project.authservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QrSessionDto {
    private String sessionToken;
    private String qrCodeDataUrl; // Base64 data:image/png;base64,...
    private String status;        // PENDING, APPROVED, EXPIRED
    private long expiresInSeconds;
    private String accessToken;
    private String refreshToken;
    private UserDto user;
}
