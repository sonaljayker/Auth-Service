package com.project.authservice.security;

import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserService customUserService;

    @Test
    void loadUserByUsername_whenUserExists_returnsUserDetails() {
        User user = User.builder()
                .email("test@example.com")
                .password("password")
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = customUserService.loadUserByUsername("test@example.com");

        assertNotNull(userDetails);
        assertEquals("test@example.com", userDetails.getUsername());
    }

    @Test
    void loadUserByUsername_whenUserDoesNotExist_throwsUsernameNotFoundException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () ->
                customUserService.loadUserByUsername("unknown@example.com"));
    }
}
