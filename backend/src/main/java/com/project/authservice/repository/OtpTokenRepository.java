package com.project.authservice.repository;

import com.project.authservice.entity.OtpToken;
import com.project.authservice.entity.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByTargetAndTypeAndVerifiedFalseOrderByCreatedAtDesc(String target, OtpType type);
    void deleteByExpiryDateBefore(Instant now);
}
