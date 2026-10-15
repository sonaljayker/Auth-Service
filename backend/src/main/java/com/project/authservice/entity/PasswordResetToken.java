package com.project.authservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String token; // Reset code / token

    @Column(nullable = false)
    private Instant expiryDate;

    @Builder.Default
    private boolean used = false;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
