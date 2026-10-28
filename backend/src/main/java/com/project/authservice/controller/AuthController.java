package com.project.authservice.controller;

import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.*;
import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import com.project.authservice.service.AuthService;
import com.project.authservice.service.QrLoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private QrLoginService qrLoginService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // OAuth SSO Login (Google, GitHub, Facebook)
    @PostMapping("/oauth/login")
    public ResponseEntity<LoginResponse> oauthLogin(@RequestBody OAuthLoginDto oAuthLoginDto) {
        return ResponseEntity.ok(authService.oauthLogin(oAuthLoginDto));
    }

    // Standard Registration
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(userDto));
    }

    // Standard Password Login (with 2FA challenge support)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody UserDto userDto) {
        return ResponseEntity.ok(authService.login(userDto));
    }

    // Verify 2FA code during login challenge
    @PostMapping("/login/2fa-verify")
    public ResponseEntity<LoginResponse> verifyTwoFactorLogin(@RequestBody TwoFactorVerifyDto verifyDto) {
        return ResponseEntity.ok(authService.verifyTwoFactor(verifyDto));
    }

    // Request OTP to email or phone
    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestBody OtpRequestDto requestDto) {
        authService.sendOtp(requestDto);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification code sent successfully to " + requestDto.getTarget()
        ));
    }

    // Login directly with OTP code
    @PostMapping("/otp/login")
    public ResponseEntity<LoginResponse> loginWithOtp(@RequestBody OtpVerifyDto verifyDto) {
        return ResponseEntity.ok(authService.loginWithOtp(verifyDto));
    }

    // Request Password Reset Code
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordDto forgotPasswordDto) {
        authService.forgotPassword(forgotPasswordDto);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password reset code sent to " + forgotPasswordDto.getEmail()
        ));
    }

    // Submit New Password with Reset Code
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDto resetPasswordDto) {
        authService.resetPassword(resetPasswordDto);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Password has been successfully updated. You can now login with your new password."
        ));
    }

    // Generate Instant Web QR Login Session
    @GetMapping("/qr/generate")
    public ResponseEntity<QrSessionDto> generateQrSession() {
        return ResponseEntity.ok(qrLoginService.createSession());
    }

    // Check status of QR Session (browser polling)
    @GetMapping("/qr/status/{sessionToken}")
    public ResponseEntity<QrSessionDto> getQrSessionStatus(@PathVariable String sessionToken) {
        return ResponseEntity.ok(qrLoginService.getSessionStatus(sessionToken));
    }

    // Approve QR session from mobile app or logged-in device
    @PostMapping("/qr/approve")
    public ResponseEntity<?> approveQrSession(@RequestBody QrApproveDto approveDto, Principal principal) {
        User user = null;
        if (principal != null) {
            user = userRepository.findByEmail(principal.getName())
                    .orElse(null);
        }

        if (user == null && approveDto.getEmail() != null && approveDto.getPassword() != null) {
            User candidate = userRepository.findByEmail(approveDto.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials"));
            if (passwordEncoder.matches(approveDto.getPassword(), candidate.getPassword())) {
                user = candidate;
            } else {
                throw new IllegalArgumentException("Invalid credentials");
            }
        }

        if (user == null) {
            throw new IllegalArgumentException("Authentication required to approve QR session");
        }

        qrLoginService.approveSession(approveDto.getSessionToken(), user);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "QR Login Session approved successfully for " + user.getEmail()
        ));
    }

    // Setup 2FA (Returns TOTP Secret & QR Code Base64 image)
    @GetMapping("/2fa/setup")
    public ResponseEntity<TwoFactorSetupResponse> setupTwoFactor(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.setupTwoFactor(principal.getName()));
    }

    // Enable 2FA after scanning QR code and submitting verification code
    @PostMapping("/2fa/enable")
    public ResponseEntity<?> enableTwoFactor(@RequestBody Map<String, String> payload, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String code = payload.get("code");
        authService.enableTwoFactor(principal.getName(), code);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Two-Factor Authentication has been successfully enabled."
        ));
    }

    // Disable 2FA
    @PostMapping("/2fa/disable")
    public ResponseEntity<?> disableTwoFactor(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        authService.disableTwoFactor(principal.getName());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Two-Factor Authentication has been disabled."
        ));
    }
}
