package com.project.authservice.security;

import com.project.authservice.entity.Role;
import com.project.authservice.entity.User;
import io.jsonwebtoken.Jwts;

import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;


@Service
public class JwtService {
    public String generateAccessToken(User user) {
        Instant  now = Instant.now();
        List<String> roles = user.getRoles() == null ? List.of():
        user.getRoles().stream().map(Role::getName).toList();
        return Jwts.builder()
                .setId(user.getId().toString())
                .setSubject(user.getId().toString())
                .setExpiration()
                .setIssuer()
                .addClaims(Map.of("Email", user.getEmail(),
                        "role", roles,
                        "typ", "access"))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();

    }

    public String generateRefreshToken(User user, String jti) {
        Instant  now = Instant.now();
        List<String> roles= user.getRoles() == null ? List.of():
        user.getRoles().stream().map(Role::getName).toList();
        return Jwts.builder()
                .addClaims(Map.of(
                        "Email", user.getEmail(),
                        "role", roles,
                        "typ", "access"
                ))
                .signWith()
                .compact();
    }
}
