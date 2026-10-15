package com.project.authservice.repository;

import com.project.authservice.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {
    Optional<PasswordResetToken> findTopByEmailAndUsedFalseOrderByCreatedAtDesc(String email);
    Optional<PasswordResetToken> findByTokenAndUsedFalse(String token);
    void deleteByExpiryDateBefore(Instant now);
}
