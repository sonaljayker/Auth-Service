package com.project.authservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "otp_tokens")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String target; // email or phone number

    @Column(nullable = false)
    private String code; // 6-digit OTP

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OtpType type;

    @Column(nullable = false)
    private Instant expiryDate;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private int attempts = 0;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
