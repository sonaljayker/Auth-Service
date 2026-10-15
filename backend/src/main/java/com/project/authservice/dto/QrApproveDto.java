package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class QrApproveDto {
    private String sessionToken;
    private String email;    // optional if using direct approval
    private String password; // optional if authenticating directly
}
