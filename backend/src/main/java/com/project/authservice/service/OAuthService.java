package com.project.authservice.service;

import com.project.authservice.dto.LoginResponse;
import com.project.authservice.dto.OAuthLoginDto;
import com.project.authservice.dto.UserDto;
import com.project.authservice.entity.Provider;
import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import com.project.authservice.security.JwtService;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public OAuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
    }

    /**
     * Process OAuth login for Google, GitHub, Facebook, etc.
     * Finds existing user by email or automatically provisions a new account.
     */
    @Transactional
    public LoginResponse processOAuthLogin(OAuthLoginDto request) {
        if (request == null || request.getProvider() == null || request.getProvider().isBlank()) {
            throw new IllegalArgumentException("OAuth provider is required");
        }

        Provider provider;
        try {
            provider = Provider.valueOf(request.getProvider().trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            provider = Provider.GOOGLE;
        }

        String email = request.getEmail();
        if (email == null || email.isBlank()) {
            // Fallback generation for providers that might not expose public email
            String identifier = request.getName() != null && !request.getName().isBlank()
                    ? request.getName().replaceAll("\\s+", "").toLowerCase()
                    : "oauth-user-" + UUID.randomUUID().toString().substring(0, 8);
            email = identifier + "@" + provider.name().toLowerCase() + ".com";
        }

        email = email.trim().toLowerCase();
        String username = request.getName() != null && !request.getName().isBlank()
                ? request.getName().trim()
                : email.split("@")[0];

        final String finalEmail = email;
        final String finalUsername = username;
        final Provider finalProvider = provider;

        User user = userRepository.findByEmail(finalEmail).map(existingUser -> {
            boolean updated = false;
            // If user's provider was local or unset, link OAuth provider
            if (existingUser.getProvider() == null || existingUser.getProvider() == Provider.LOCAL) {
                existingUser.setProvider(finalProvider);
                updated = true;
            }
            // If username was unset or blank, set it from OAuth profile
            if ((existingUser.getUsername() == null || existingUser.getUsername().isBlank()) && !finalUsername.isBlank()) {
                existingUser.setUsername(finalUsername);
                updated = true;
            }
            return updated ? userRepository.save(existingUser) : existingUser;
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .email(finalEmail)
                    .username(finalUsername)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .enable(true)
                    .provider(finalProvider)
                    .build();
            return userRepository.save(newUser);
        });

        if (!user.isEnabled()) {
            throw new IllegalArgumentException("Account is disabled. Please contact support.");
        }

        // If user already had 2FA enabled, enforce 2FA verification
        if (user.isTwoFactorEnabled()) {
            String tempToken = jwtService.generateTempToken(user);
            return LoginResponse.builder()
                    .twoFactorRequired(true)
                    .tempToken(tempToken)
                    .message("Two-factor authentication required for " + user.getEmail())
                    .build();
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, UUID.randomUUID().toString());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .twoFactorRequired(false)
                .message("Successfully authenticated with " + provider.name())
                .user(modelMapper != null ? modelMapper.map(user, UserDto.class) : null)
                .build();
    }
}
