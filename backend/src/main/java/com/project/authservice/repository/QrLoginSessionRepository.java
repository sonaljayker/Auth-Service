package com.project.authservice.repository;

import com.project.authservice.entity.QrLoginSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface QrLoginSessionRepository extends JpaRepository<QrLoginSession, UUID> {
    Optional<QrLoginSession> findBySessionToken(String sessionToken);
    void deleteByExpiresAtBefore(Instant now);
}
