package com.example.payment_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Component
public class JwtUtil {

    // Read from application.yml — same value must exist in all services
    @Value("${jwt.secret}")
    private String secret;

    // Payment-service only validates tokens, never generates them
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
