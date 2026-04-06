package com.example.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    // This CORS config lives in the gateway — not in individual services.
    // Individual services do NOT need their own CORS config since all
    // browser traffic comes through this gateway.
    @Bean
    public CorsWebFilter corsWebFilter() {

        CorsConfiguration config = new CorsConfiguration();

        // Allow your frontend origin.
        // In production, replace with your actual deployed frontend URL.
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",   // Vite dev server
            "http://localhost:4173"    // Vite preview
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Allow Authorization header so JWT tokens pass through
        config.setAllowedHeaders(List.of("*"));

        // Not needed since we use JWT (stateless) — no cookies
        config.setAllowCredentials(false);

        // Cache preflight response for 30 minutes — reduces OPTIONS noise
        config.setMaxAge(1800L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
