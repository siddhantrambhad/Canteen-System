package com.example.api_gateway.config;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import reactor.core.publisher.Mono;

// A simple global filter that logs every incoming request.
// Helps interns see what routes are being hit during development.
// Nothing fancy — just a System.out.println equivalent for the gateway.
@Configuration
public class LoggingFilter {

    @Bean
    @Order(1)
    public GlobalFilter logRequestFilter() {
        return (exchange, chain) -> {
            String method = exchange.getRequest().getMethod().name();
            String path   = exchange.getRequest().getURI().getPath();

            System.out.println(">>> Gateway: " + method + " " + path);

            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                int statusCode = exchange.getResponse().getStatusCode() != null
                        ? exchange.getResponse().getStatusCode().value()
                        : 0;
                System.out.println("<<< Gateway: " + method + " " + path + " → " + statusCode);
            }));
        };
    }
}
