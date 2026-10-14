package com.project.authservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.authservice.Exception.GlobalExceptionHandler;
import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.UserDto;
import com.project.authservice.service.Impl.UserServiceImp;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserServiceImp userServiceImp;

    @InjectMocks
    private UserController userController;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private UUID userId;
    private UserDto testUserDto;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(userController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        userId = UUID.randomUUID();
        testUserDto = UserDto.builder()
                .id(userId)
                .email("user@example.com")
                .username("testuser")
                .enable(true)
                .build();
    }

    @Test
    void createUser_returns201Created() throws Exception {
        when(userServiceImp.createUser(any(UserDto.class))).thenReturn(testUserDto);

        mockMvc.perform(post("/api/v1/test-users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUserDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void getAllUsers_returns200OkWithList() throws Exception {
        when(userServiceImp.getAllUsers()).thenReturn(List.of(testUserDto));

        mockMvc.perform(get("/api/v1/test-users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("user@example.com"));
    }

    @Test
    void getUserByEmail_existingUser_returns200Ok() throws Exception {
        when(userServiceImp.getUserByEmail("user@example.com")).thenReturn(testUserDto);

        mockMvc.perform(get("/api/v1/test-users/email/user@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    @Test
    void getUserByEmail_nonExistingUser_returns404NotFound() throws Exception {
        when(userServiceImp.getUserByEmail("user@example.com"))
                .thenThrow(new ResourceNotFoundException("User is not found with given email "));

        mockMvc.perform(get("/api/v1/test-users/email/user@example.com"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.statusCode").value(404));
    }

    @Test
    void getUserById_existingUser_returns200Ok() throws Exception {
        when(userServiceImp.getUserById(userId.toString())).thenReturn(testUserDto);

        mockMvc.perform(get("/api/v1/test-users/" + userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()));
    }

    @Test
    void updateUser_validRequest_returns200Ok() throws Exception {
        when(userServiceImp.updateUser(any(UserDto.class), eq(userId.toString()))).thenReturn(testUserDto);

        mockMvc.perform(put("/api/v1/test-users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testUserDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()));
    }

    @Test
    void deleteUser_existingUser_returns200Ok() throws Exception {
        doNothing().when(userServiceImp).deleteUser(userId.toString());

        mockMvc.perform(delete("/api/v1/test-users/" + userId))
                .andExpect(status().isOk());

        verify(userServiceImp).deleteUser(userId.toString());
    }
}
