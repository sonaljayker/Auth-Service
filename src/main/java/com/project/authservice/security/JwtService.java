package com.project.authservice.security;

import com.project.authservice.entity.Role;
import com.project.authservice.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
public class JwtService {
    private final SecretKey secretKey;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;
    private final String issuer;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-ttl-seconds}") long accessTtlSeconds,
            @Value("${security.jwt.refresh-ttl-seconds}") long refreshTtlSeconds,
            @Value("${security.jwt.issuer}") String issuer) {

        if (secret == null || secret.isEmpty()) {
            throw new IllegalArgumentException("secret cannot be null or empty");
        }

        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
        this.issuer = issuer;
    }


    public String generateAccessToken(User user) {
        Instant  now = Instant.now();
        List<String> roles = user.getRoles() == null ? List.of():
        user.getRoles().stream().map(Role::getName).toList();
        return Jwts.builder()
                .setId(UUID.randomUUID().toString())
                .setSubject(user.getId().toString())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .setIssuer(issuer)
                .addClaims(Map.of("email", user.getEmail(),
                        "role", roles,
                        "typ", "access"))
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public String generateRefreshToken(User user, String jti) {
        Instant now = Instant.now();
        List<String> roles= user.getRoles() == null ? List.of():
        user.getRoles().stream().map(Role::getName).toList();
        return Jwts.builder()
                .setId(jti)
                .setSubject(user.getId().toString())
                .setIssuer(issuer)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(refreshTtlSeconds)))
                .addClaims(Map.of(
                        "email", user.getEmail(),
                        "role", roles,
                        "typ", "refresh"
                ))
                .signWith(secretKey,SignatureAlgorithm.HS512)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        try {
            return Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
        } catch (JwtException e) {
            throw e;
        }
    }

    public boolean isAccessToken(String token) {
        Claims claims = parse(token).getBody();
        return "access".equals(claims.get("typ"));
    }

    public boolean isRefreshToken(String token) {
        Claims claims = parse(token).getBody();
        return "refresh".equals(claims.get("typ"));
    }

    public UUID getUserId(String token) {
        Claims claims = parse(token).getBody();
        return UUID.fromString(claims.getSubject());
    }

    public String getJti(String token) {
        return parse(token).getBody().getId();
    }

}
