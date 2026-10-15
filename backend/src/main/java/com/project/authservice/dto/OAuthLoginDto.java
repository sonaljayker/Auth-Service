package com.project.authservice.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OAuthLoginDto {
    private String provider;  // "GOOGLE", "GITHUB", "FACEBOOK"
    private String email;
    private String name;
    private String idToken;   // OAuth token or code
    private String avatarUrl;
}
