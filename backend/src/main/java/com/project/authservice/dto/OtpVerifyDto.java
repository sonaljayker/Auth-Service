package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpVerifyDto {
    private String target; // Email or phone number
    private String code;   // 6-digit OTP code
    private String type;   // LOGIN, PASSWORD_RESET, TWO_FACTOR
}
