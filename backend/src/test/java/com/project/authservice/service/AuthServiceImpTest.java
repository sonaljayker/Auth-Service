package com.project.authservice.service;

import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.LoginResponse;
import com.project.authservice.dto.UserDto;
import com.project.authservice.entity.Provider;
import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import com.project.authservice.security.JwtService;
import com.project.authservice.service.Impl.AuthServiceImp;
import com.project.authservice.service.OtpService;
import com.project.authservice.service.TotpService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImpTest {

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private TotpService totpService;

    @Mock
    private OtpService otpService;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private AuthServiceImp authService;

    private UserDto testUserDto;
    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUserDto = UserDto.builder()
                .email("user@example.com")
                .password("rawPassword123")
                .username("testuser")
                .build();

        testUser = User.builder()
                .id(userId)
                .email("user@example.com")
                .password("encodedPassword123")
                .username("testuser")
                .enable(true)
                .provider(Provider.LOCAL)
                .build();
    }

    @Test
    void register_withNullUserDto_throwsIllegalArgumentException() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.register(null));
        assertEquals("User details are required", ex.getMessage());
    }

    @Test
    void register_withNullOrBlankEmail_throwsIllegalArgumentException() {
        testUserDto.setEmail(null);
        IllegalArgumentException ex1 = assertThrows(IllegalArgumentException.class, () ->
                authService.register(testUserDto));
        assertEquals("Email is required", ex1.getMessage());

        testUserDto.setEmail("   ");
        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class, () ->
                authService.register(testUserDto));
        assertEquals("Email is required", ex2.getMessage());
    }

    @Test
    void register_withNullOrBlankPassword_throwsIllegalArgumentException() {
        testUserDto.setPassword(null);
        IllegalArgumentException ex1 = assertThrows(IllegalArgumentException.class, () ->
                authService.register(testUserDto));
        assertEquals("Password is required", ex1.getMessage());

        testUserDto.setPassword("");
        IllegalArgumentException ex2 = assertThrows(IllegalArgumentException.class, () ->
                authService.register(testUserDto));
        assertEquals("Password is required", ex2.getMessage());
    }

    @Test
    void register_validUser_encodesPasswordAndCallsUserService() {
        when(passwordEncoder.encode("rawPassword123")).thenReturn("encodedPassword123");
        when(userService.createUser(any(UserDto.class))).thenReturn(testUserDto);

        UserDto result = authService.register(testUserDto);

        assertNotNull(result);
        verify(passwordEncoder).encode("rawPassword123");
        verify(userService).createUser(testUserDto);
        assertEquals("encodedPassword123", testUserDto.getPassword());
    }

    @Test
    void login_withNullOrBlankEmail_throwsIllegalArgumentException() {
        testUserDto.setEmail(null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login(testUserDto));
        assertEquals("Email is required", ex.getMessage());
    }

    @Test
    void login_withNullOrBlankPassword_throwsIllegalArgumentException() {
        testUserDto.setPassword(" ");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login(testUserDto));
        assertEquals("Password is required", ex.getMessage());
    }

    @Test
    void login_userNotFound_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                authService.login(testUserDto));
        assertEquals("Invalid Email or Password", ex.getMessage());
    }

    @Test
    void login_passwordMismatch_throwsIllegalArgumentException() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("rawPassword123", "encodedPassword123")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.login(testUserDto));
        assertEquals("Invalid Email or Password", ex.getMessage());
    }

    @Test
    void login_successful_returnsAccessAndRefreshTokens() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("rawPassword123", "encodedPassword123")).thenReturn(true);
        when(jwtService.generateAccessToken(testUser)).thenReturn("mockAccessToken");
        when(jwtService.generateRefreshToken(eq(testUser), anyString())).thenReturn("mockRefreshToken");

        LoginResponse response = authService.login(testUserDto);

        assertNotNull(response);
        assertEquals("mockAccessToken", response.getAccessToken());
        assertEquals("mockRefreshToken", response.getRefreshToken());
        assertEquals("Login successful", response.getMessage());
    }
}
