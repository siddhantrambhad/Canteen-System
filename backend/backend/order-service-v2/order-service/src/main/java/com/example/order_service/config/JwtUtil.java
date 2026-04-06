package com.example.order_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

//    private static final long EXPIRY_MS = 86400000;
//
//    public String generateToken(Long userId, String email, String role) {
//        return Jwts.builder()
//                .subject(email)
//                .claim("userId", userId)
//                .claim("role", role)
//                .issuedAt(new Date())
//                .expiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
//                .signWith(getKey())
//                .compact();
//    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractRole(String token) {
        return (String) extractClaims(token).get("role");
    }

    public Long extractUserId(String token) {
        return ((Number) extractClaims(token).get("userId")).longValue();
    }

    private SecretKey getKey() {
        byte[] keyBytes = Arrays.copyOf(
            secret.getBytes(StandardCharsets.UTF_8), 32
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}