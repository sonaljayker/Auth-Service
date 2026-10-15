package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TwoFactorSetupResponse {
    private String secret;
    private String qrCodeDataUrl; // data:image/png;base64,...
    private String manualKey;
}
