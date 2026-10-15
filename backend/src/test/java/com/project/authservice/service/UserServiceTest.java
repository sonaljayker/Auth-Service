package com.project.authservice.service;

import com.project.authservice.Exception.ResourceNotFoundException;
import com.project.authservice.dto.UserDto;
import com.project.authservice.entity.Provider;
import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Spy
    private ModelMapper modelMapper = new ModelMapper();

    @InjectMocks
    private UserService userService;

    private UserDto testUserDto;
    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUserDto = UserDto.builder()
                .email("test@example.com")
                .password("password123")
                .username("testuser")
                .enable(true)
                .build();

        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .password("password123")
                .username("testuser")
                .enable(true)
                .provider(Provider.LOCAL)
                .build();
    }

    @Test
    void createUser_nullOrBlankEmail_throwsIllegalArgumentException() {
        testUserDto.setEmail(null);
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUserDto));

        testUserDto.setEmail("   ");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUserDto));
    }

    @Test
    void createUser_nullOrBlankPassword_throwsIllegalArgumentException() {
        testUserDto.setPassword(null);
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUserDto));

        testUserDto.setPassword("");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(testUserDto));
    }

    @Test
    void createUser_emailAlreadyExists_throwsIllegalArgumentException() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                userService.createUser(testUserDto));
        assertEquals("Email already exists", ex.getMessage());
    }

    @Test
    void createUser_success_returnsCreatedUserDto() {
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto created = userService.createUser(testUserDto);

        assertNotNull(created);
        assertEquals("test@example.com", created.getEmail());
        assertEquals("testuser", created.getUsername());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void getUserByEmail_existingEmail_returnsUserDto() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        UserDto result = userService.getUserByEmail("test@example.com");

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        assertEquals("testuser", result.getUsername());
    }

    @Test
    void getUserByEmail_nonExistingEmail_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.getUserByEmail("missing@example.com"));
    }

    @Test
    void getUserById_existingId_returnsUserDto() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        UserDto result = userService.getUserById(userId.toString());

        assertNotNull(result);
        assertEquals(userId, result.getId());
    }

    @Test
    void getUserById_nonExistingId_throwsResourceNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.getUserById(userId.toString()));
    }

    @Test
    void updateUser_existingUser_updatesFieldsAndReturnsUpdatedDto() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        UserDto updateDto = UserDto.builder()
                .username("newUsername")
                .password("newPassword")
                .provider(Provider.GOOGLE)
                .enable(false)
                .build();

        UserDto result = userService.updateUser(updateDto, userId.toString());

        assertNotNull(result);
        verify(userRepository).save(testUser);
        assertEquals("newUsername", testUser.getUsername());
        assertEquals("newPassword", testUser.getPassword());
        assertEquals(Provider.GOOGLE, testUser.getProvider());
        assertFalse(testUser.isEnable());
    }

    @Test
    void updateUser_nonExistingUser_throwsResourceNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.updateUser(testUserDto, userId.toString()));
    }

    @Test
    void deleteUser_existingUser_deletesSuccessfully() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        userService.deleteUser(userId.toString());

        verify(userRepository).delete(testUser);
    }

    @Test
    void deleteUser_nonExistingUser_throwsResourceNotFoundException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                userService.deleteUser(userId.toString()));
    }

    @Test
    void getAllUsers_returnsListOfUserDtos() {
        when(userRepository.findAll()).thenReturn(List.of(testUser));

        Iterable<UserDto> allUsers = userService.getAllUsers();

        assertNotNull(allUsers);
        List<UserDto> userList = (List<UserDto>) allUsers;
        assertEquals(1, userList.size());
        assertEquals("test@example.com", userList.get(0).getEmail());
    }
}
