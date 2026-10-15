package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TwoFactorVerifyDto {
    private String tempToken; // Temporary token from initial login step
    private String code;      // 6-digit TOTP code
}
