package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResetPasswordDto {
    private String email;
    private String resetCode; // 6-digit verification code sent to email
    private String newPassword;
}
