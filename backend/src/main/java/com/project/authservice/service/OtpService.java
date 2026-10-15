package com.project.authservice.service;

import com.project.authservice.entity.OtpToken;
import com.project.authservice.entity.OtpType;
import com.project.authservice.repository.OtpTokenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final GmailNotificationService gmailNotificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(OtpTokenRepository otpTokenRepository, GmailNotificationService gmailNotificationService) {
        this.otpTokenRepository = otpTokenRepository;
        this.gmailNotificationService = gmailNotificationService;
    }

    /**
     * Generate a new 6-digit numeric OTP and send via AWS SES or SNS.
     */
    @Transactional
    public String generateAndSendOtp(String target, OtpType type) {
        if (target == null || target.isBlank()) {
            throw new IllegalArgumentException("Target email or phone is required");
        }

        String normalizedTarget = target.trim().toLowerCase();
        String code = String.format("%06d", secureRandom.nextInt(1000000));
        Instant expiry = Instant.now().plus(5, ChronoUnit.MINUTES);

        OtpToken otpToken = OtpToken.builder()
                .target(normalizedTarget)
                .code(code)
                .type(type)
                .expiryDate(expiry)
                .verified(false)
                .attempts(0)
                .build();

        otpTokenRepository.save(otpToken);

        String purpose = switch (type) {
            case LOGIN -> "Account Login";
            case PASSWORD_RESET -> "Password Reset";
            case TWO_FACTOR -> "Two-Factor Authentication";
        };

        gmailNotificationService.sendOtpNotification(normalizedTarget, code, purpose);
        return code;
    }

    /**
     * Verify an OTP code.
     */
    @Transactional
    public boolean verifyOtp(String target, String code, OtpType type) {
        if (target == null || code == null || code.isBlank()) {
            throw new IllegalArgumentException("Target and verification code are required");
        }

        String normalizedTarget = target.trim().toLowerCase();
        OtpToken token = otpTokenRepository.findTopByTargetAndTypeAndVerifiedFalseOrderByCreatedAtDesc(normalizedTarget, type)
                .orElseThrow(() -> new IllegalArgumentException("No active OTP request found for this target"));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Verification code has expired. Please request a new one.");
        }

        if (token.getAttempts() >= 5) {
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new code.");
        }

        token.setAttempts(token.getAttempts() + 1);

        if (!token.getCode().equals(code.trim())) {
            otpTokenRepository.save(token);
            throw new IllegalArgumentException("Invalid verification code. Please try again.");
        }

        token.setVerified(true);
        otpTokenRepository.save(token);
        return true;
    }
}
