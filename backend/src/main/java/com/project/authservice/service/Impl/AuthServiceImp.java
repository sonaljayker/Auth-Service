package com.project.authservice.service.Impl;

import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.*;
import com.project.authservice.entity.OtpType;
import com.project.authservice.entity.Provider;
import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import com.project.authservice.security.JwtService;
import com.project.authservice.service.AuthService;
import com.project.authservice.service.OtpService;
import com.project.authservice.service.TotpService;
import com.project.authservice.service.UserService;
import io.jsonwebtoken.Claims;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthServiceImp implements AuthService {

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private TotpService totpService;
    @Autowired
    private OtpService otpService;
    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserDto register(UserDto userDto) {
        if (userDto == null) {
            throw new IllegalArgumentException("User details are required");
        }
        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (userDto.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long");
        }

        if (userRepository.existsByEmail(userDto.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        userDto.setEmail(userDto.getEmail().trim().toLowerCase());
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return userService.createUser(userDto);
    }

    @Override
    public LoginResponse login(UserDto userDto) {
        if (userDto == null || userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is required");
        }

        String email = userDto.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid Email or Password"));

        if (!passwordEncoder.matches(userDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid Email or Password");
        }

        // If 2FA is enabled for this user, issue a temporary 2FA token
        if (user.isTwoFactorEnabled()) {
            String tempToken = jwtService.generateTempToken(user);
            return LoginResponse.builder()
                    .twoFactorRequired(true)
                    .tempToken(tempToken)
                    .message("Two-factor authentication required. Please enter your 6-digit authenticator code.")
                    .build();
        }

        // Standard direct login
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .twoFactorRequired(false)
                .message("Login successful")
                .user(modelMapper != null ? modelMapper.map(user, UserDto.class) : null)
                .build();
    }

    @Override
    public LoginResponse verifyTwoFactor(TwoFactorVerifyDto verifyDto) {
        if (verifyDto == null || verifyDto.getTempToken() == null || verifyDto.getCode() == null) {
            throw new IllegalArgumentException("Temporary token and 2FA code are required");
        }

        Claims claims = jwtService.parse(verifyDto.getTempToken()).getBody();
        if (!"2fa_temp".equals(claims.get("typ"))) {
            throw new IllegalArgumentException("Invalid 2FA challenge token");
        }

        UUID userId = UUID.fromString(claims.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isTwoFactorEnabled() || user.getTwoFactorSecret() == null) {
            throw new IllegalArgumentException("2FA is not enabled on this account");
        }

        boolean isValid = totpService.verifyCode(user.getTwoFactorSecret(), verifyDto.getCode().trim());
        if (!isValid) {
            throw new IllegalArgumentException("Invalid 2FA code. Please check your authenticator app.");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .twoFactorRequired(false)
                .message("Two-factor verification successful")
                .user(modelMapper != null ? modelMapper.map(user, UserDto.class) : null)
                .build();
    }

    @Override
    public void sendOtp(OtpRequestDto requestDto) {
        if (requestDto == null || requestDto.getTarget() == null || requestDto.getTarget().isBlank()) {
            throw new IllegalArgumentException("Target email or phone number is required");
        }

        OtpType type = OtpType.LOGIN;
        if (requestDto.getType() != null && !requestDto.getType().isBlank()) {
            try {
                type = OtpType.valueOf(requestDto.getType().toUpperCase());
            } catch (Exception ignored) {}
        }

        otpService.generateAndSendOtp(requestDto.getTarget(), type);
    }

    @Override
    @Transactional
    public LoginResponse loginWithOtp(OtpVerifyDto verifyDto) {
        if (verifyDto == null || verifyDto.getTarget() == null || verifyDto.getCode() == null) {
            throw new IllegalArgumentException("Target and OTP code are required");
        }

        String target = verifyDto.getTarget().trim().toLowerCase();
        otpService.verifyOtp(target, verifyDto.getCode(), OtpType.LOGIN);

        // Fetch or create user
        User user = userRepository.findByEmail(target).orElseGet(() -> {
            User newUser = User.builder()
                    .email(target)
                    .username(target.contains("@") ? target.split("@")[0] : target)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .enable(true)
                    .provider(Provider.LOCAL)
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .twoFactorRequired(false)
                .message("OTP login successful")
                .user(modelMapper != null ? modelMapper.map(user, UserDto.class) : null)
                .build();
    }

    @Override
    public void forgotPassword(ForgotPasswordDto forgotPasswordDto) {
        if (forgotPasswordDto == null || forgotPasswordDto.getEmail() == null || forgotPasswordDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }

        String email = forgotPasswordDto.getEmail().trim().toLowerCase();
        if (!userRepository.existsByEmail(email)) {
            throw new ResourceNotFoundException("No account found with email: " + email);
        }

        otpService.generateAndSendOtp(email, OtpType.PASSWORD_RESET);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordDto resetPasswordDto) {
        if (resetPasswordDto == null || resetPasswordDto.getEmail() == null || resetPasswordDto.getResetCode() == null || resetPasswordDto.getNewPassword() == null) {
            throw new IllegalArgumentException("Email, reset code, and new password are required");
        }

        if (resetPasswordDto.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters long");
        }

        String email = resetPasswordDto.getEmail().trim().toLowerCase();
        otpService.verifyOtp(email, resetPasswordDto.getResetCode(), OtpType.PASSWORD_RESET);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(resetPasswordDto.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public TwoFactorSetupResponse setupTwoFactor(String userEmail) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String secret = totpService.generateSecret();
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        String otpAuthUri = totpService.getOtpAuthUri(secret, user.getEmail(), "AuthService");
        String qrCodeDataUrl = totpService.generateQrCodeDataUrl(otpAuthUri, 240, 240);

        return TwoFactorSetupResponse.builder()
                .secret(secret)
                .manualKey(secret)
                .qrCodeDataUrl(qrCodeDataUrl)
                .build();
    }

    @Override
    @Transactional
    public void enableTwoFactor(String userEmail, String code) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getTwoFactorSecret() == null) {
            throw new IllegalArgumentException("Please initialize 2FA setup first before enabling");
        }

        boolean isValid = totpService.verifyCode(user.getTwoFactorSecret(), code.trim());
        if (!isValid) {
            throw new IllegalArgumentException("Invalid 6-digit code. Please verify against your Authenticator app.");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void disableTwoFactor(String userEmail) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }
}
