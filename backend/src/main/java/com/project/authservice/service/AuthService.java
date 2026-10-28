package com.project.authservice.service;

import com.project.authservice.dto.*;

public interface AuthService {
    UserDto register(UserDto userDto);
    LoginResponse login(UserDto userDto);
    LoginResponse oauthLogin(OAuthLoginDto oAuthLoginDto);
    LoginResponse verifyTwoFactor(TwoFactorVerifyDto verifyDto);
    void sendOtp(OtpRequestDto requestDto);
    LoginResponse loginWithOtp(OtpVerifyDto verifyDto);
    void forgotPassword(ForgotPasswordDto forgotPasswordDto);
    void resetPassword(ResetPasswordDto resetPasswordDto);
    TwoFactorSetupResponse setupTwoFactor(String userEmail);
    void enableTwoFactor(String userEmail, String code);
    void disableTwoFactor(String userEmail);
}
