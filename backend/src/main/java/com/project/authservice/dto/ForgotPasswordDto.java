package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ForgotPasswordDto {
    private String email;
}
