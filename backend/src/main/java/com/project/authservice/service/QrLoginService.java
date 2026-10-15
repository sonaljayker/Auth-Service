package com.project.authservice.service;

import com.project.authservice.dto.QrSessionDto;
import com.project.authservice.dto.UserDto;
import com.project.authservice.entity.QrLoginSession;
import com.project.authservice.entity.User;
import com.project.authservice.repository.QrLoginSessionRepository;
import com.project.authservice.repository.UserRepository;
import com.project.authservice.security.JwtService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class QrLoginService {

    private final QrLoginSessionRepository qrLoginSessionRepository;
    private final TotpService totpService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public QrLoginService(
            QrLoginSessionRepository qrLoginSessionRepository,
            TotpService totpService,
            JwtService jwtService,
            UserRepository userRepository,
            ModelMapper modelMapper) {
        this.qrLoginSessionRepository = qrLoginSessionRepository;
        this.totpService = totpService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    /**
     * Create a new QR Login Session with a ZXing-generated Base64 QR code image.
     */
    @Transactional
    public QrSessionDto createSession() {
        String sessionToken = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plus(3, ChronoUnit.MINUTES);

        QrLoginSession session = QrLoginSession.builder()
                .sessionToken(sessionToken)
                .status("PENDING")
                .createdAt(Instant.now())
                .expiresAt(expiresAt)
                .build();

        qrLoginSessionRepository.save(session);

        // Payload encoded inside the QR code
        String qrPayload = String.format("{\"action\":\"AUTH_SERVICE_QR_LOGIN\",\"sessionToken\":\"%s\"}", sessionToken);
        String qrCodeDataUrl = totpService.generateQrCodeDataUrl(qrPayload, 260, 260);

        return QrSessionDto.builder()
                .sessionToken(sessionToken)
                .qrCodeDataUrl(qrCodeDataUrl)
                .status("PENDING")
                .expiresInSeconds(180)
                .build();
    }

    /**
     * Check status of a QR login session (polled by browser).
     */
    @Transactional
    public QrSessionDto getSessionStatus(String sessionToken) {
        QrLoginSession session = qrLoginSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or non-existent QR session"));

        if (session.getExpiresAt().isBefore(Instant.now()) && "PENDING".equals(session.getStatus())) {
            session.setStatus("EXPIRED");
            qrLoginSessionRepository.save(session);
        }

        QrSessionDto.QrSessionDtoBuilder builder = QrSessionDto.builder()
                .sessionToken(session.getSessionToken())
                .status(session.getStatus())
                .expiresInSeconds(Math.max(0, ChronoUnit.SECONDS.between(Instant.now(), session.getExpiresAt())));

        if ("APPROVED".equals(session.getStatus())) {
            builder.accessToken(session.getAccessToken());
            builder.refreshToken(session.getRefreshToken());
            if (session.getUserEmail() != null) {
                userRepository.findByEmail(session.getUserEmail())
                        .ifPresent(u -> builder.user(modelMapper.map(u, UserDto.class)));
            }
        }

        return builder.build();
    }

    /**
     * Approve a QR session on behalf of a user.
     */
    @Transactional
    public boolean approveSession(String sessionToken, User user) {
        QrLoginSession session = qrLoginSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid QR session"));

        if (session.getExpiresAt().isBefore(Instant.now())) {
            session.setStatus("EXPIRED");
            qrLoginSessionRepository.save(session);
            throw new IllegalArgumentException("QR code session has expired. Please refresh the QR code on your screen.");
        }

        if (!"PENDING".equals(session.getStatus())) {
            throw new IllegalArgumentException("QR session is no longer pending");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        session.setStatus("APPROVED");
        session.setUserEmail(user.getEmail());
        session.setAccessToken(accessToken);
        session.setRefreshToken(refreshToken);

        qrLoginSessionRepository.save(session);
        return true;
    }
}
