package com.project.authservice.security;

import com.project.authservice.entity.Provider;
import com.project.authservice.entity.Role;
import com.project.authservice.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "my-very-long-and-secure-test-secret-key-1234567890-test-secret-key-1234567890-512bits-long!";
    private final long accessTtl = 900;
    private final long refreshTtl = 604800;
    private final String issuer = "auth-service-test";

    private User testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(secret, accessTtl, refreshTtl, issuer);
        userId = UUID.randomUUID();
        Role roleUser = Role.builder().id(UUID.randomUUID()).name("ROLE_USER").build();
        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .username("testuser")
                .password("encoded_pass")
                .enable(true)
                .provider(Provider.LOCAL)
                .roles(Set.of(roleUser))
                .build();
    }

    @Test
    void constructor_withNullSecret_throwsException() {
        assertThrows(IllegalArgumentException.class, () ->
                new JwtService(null, accessTtl, refreshTtl, issuer));
    }

    @Test
    void constructor_withEmptySecret_throwsException() {
        assertThrows(IllegalArgumentException.class, () ->
                new JwtService("", accessTtl, refreshTtl, issuer));
    }

    @Test
    void generateAccessToken_createsValidAccessToken() {
        String token = jwtService.generateAccessToken(testUser);

        assertNotNull(token);
        assertTrue(jwtService.isAccessToken(token));
        assertFalse(jwtService.isRefreshToken(token));

        assertEquals(userId, jwtService.getUserId(token));
        assertEquals("test@example.com", jwtService.getEmail(token));

        List<String> roles = jwtService.getRoles(token);
        assertNotNull(roles);
        assertTrue(roles.contains("ROLE_USER"));

        Jws<Claims> claimsJws = jwtService.parse(token);
        assertEquals(issuer, claimsJws.getBody().getIssuer());
    }

    @Test
    void generateAccessToken_withNullRoles_createsTokenWithEmptyRoles() {
        testUser.setRoles(null);
        String token = jwtService.generateAccessToken(testUser);

        assertNotNull(token);
        assertTrue(jwtService.isAccessToken(token));
        List<String> roles = jwtService.getRoles(token);
        assertNotNull(roles);
        assertTrue(roles.isEmpty());
    }

    @Test
    void generateRefreshToken_createsValidRefreshToken() {
        String jti = UUID.randomUUID().toString();
        String token = jwtService.generateRefreshToken(testUser, jti);

        assertNotNull(token);
        assertTrue(jwtService.isRefreshToken(token));
        assertFalse(jwtService.isAccessToken(token));

        assertEquals(userId, jwtService.getUserId(token));
        assertEquals("test@example.com", jwtService.getEmail(token));
        assertEquals(jti, jwtService.getJti(token));
    }

    @Test
    void parse_withInvalidToken_throwsException() {
        assertThrows(Exception.class, () -> jwtService.parse("invalid.token.structure"));
    }
}
