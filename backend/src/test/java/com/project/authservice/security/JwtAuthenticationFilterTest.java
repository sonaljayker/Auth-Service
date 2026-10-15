package com.project.authservice.security;

import com.project.authservice.entity.Role;
import com.project.authservice.entity.User;
import com.project.authservice.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_withoutAuthHeader_passesFilterChain() throws ServletException, IOException {
        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_withNonBearerHeader_passesFilterChain() throws ServletException, IOException {
        request.addHeader("Authorization", "Basic 123456");

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_withRefreshToken_doesNotAuthenticate() throws ServletException, IOException {
        request.addHeader("Authorization", "Bearer refresh.token.value");
        when(jwtService.isAccessToken("refresh.token.value")).thenReturn(false);

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilterInternal_withValidAccessToken_setsSecurityContext() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        String token = "valid.access.token";
        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.isAccessToken(token)).thenReturn(true);

        @SuppressWarnings("unchecked")
        Jws<Claims> jwsMock = mock(Jws.class);
        Claims claimsMock = mock(Claims.class);
        when(claimsMock.getSubject()).thenReturn(userId.toString());
        when(jwsMock.getBody()).thenReturn(claimsMock);
        when(jwtService.parse(token)).thenReturn(jwsMock);

        Role role = Role.builder().id(UUID.randomUUID()).name("ROLE_USER").build();
        User user = User.builder()
                .id(userId)
                .email("test@example.com")
                .enable(true)
                .roles(Set.of(role))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("test@example.com", SecurityContextHolder.getContext().getAuthentication().getName());
        assertEquals(1, SecurityContextHolder.getContext().getAuthentication().getAuthorities().size());
    }

    @Test
    void doFilterInternal_withDisabledUser_doesNotAuthenticate() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        String token = "valid.access.token";
        request.addHeader("Authorization", "Bearer " + token);

        when(jwtService.isAccessToken(token)).thenReturn(true);

        @SuppressWarnings("unchecked")
        Jws<Claims> jwsMock = mock(Jws.class);
        Claims claimsMock = mock(Claims.class);
        when(claimsMock.getSubject()).thenReturn(userId.toString());
        when(jwsMock.getBody()).thenReturn(claimsMock);
        when(jwtService.parse(token)).thenReturn(jwsMock);

        User disabledUser = User.builder()
                .id(userId)
                .email("disabled@example.com")
                .enable(false)
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(disabledUser));

        jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
