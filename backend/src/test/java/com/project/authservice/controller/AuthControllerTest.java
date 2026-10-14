package com.project.authservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.authservice.Exception.GlobalExceptionHandler;
import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.UserDto;
import com.project.authservice.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void registerUser_validRequest_returns201Created() throws Exception {
        UserDto requestDto = UserDto.builder()
                .email("test@example.com")
                .password("password123")
                .username("testuser")
                .build();

        UserDto responseDto = UserDto.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .username("testuser")
                .build();

        when(authService.register(any(UserDto.class))).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void registerUser_withIllegalArgumentException_returns400BadRequest() throws Exception {
        UserDto requestDto = UserDto.builder().build();

        when(authService.register(any(UserDto.class)))
                .thenThrow(new IllegalArgumentException("Email is required"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is required"))
                .andExpect(jsonPath("$.statusCode").value(400));
    }

    @Test
    void login_validRequest_returns200Ok() throws Exception {
        UserDto requestDto = UserDto.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        Map<String, String> responseMap = Map.of(
                "accessToken", "sample.access.token",
                "refreshToken", "sample.refresh.token",
                "message", "Login successful"
        );

        when(authService.login(any(UserDto.class))).thenReturn(responseMap);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("sample.access.token"))
                .andExpect(jsonPath("$.refreshToken").value("sample.refresh.token"))
                .andExpect(jsonPath("$.message").value("Login successful"));
    }

    @Test
    void login_userNotFound_returns404NotFound() throws Exception {
        UserDto requestDto = UserDto.builder()
                .email("notfound@example.com")
                .password("password123")
                .build();

        when(authService.login(any(UserDto.class)))
                .thenThrow(new ResourceNotFoundException("Invalid Email or Password"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Invalid Email or Password"))
                .andExpect(jsonPath("$.statusCode").value(404));
    }
}
