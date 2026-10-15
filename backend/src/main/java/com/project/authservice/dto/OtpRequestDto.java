package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpRequestDto {
    private String target; // Email or phone number
    private String type;   // LOGIN, PASSWORD_RESET, TWO_FACTOR
}
