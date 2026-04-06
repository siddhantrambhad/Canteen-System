package com.example.payment_service.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    // Internal secret shared between order-service and payment-service via application.yml
    // order-service sends this as X-Internal-Secret header when calling POST /payments
    @Value("${internal.secret}")
    private String internalSecret;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String path   = request.getRequestURI();
        String method = request.getMethod();

        // POST /payments is called internally by order-service via RestTemplate
        // order-service sends X-Internal-Secret header instead of a JWT
        // We validate the secret here so random external callers cannot inject fake payments
        if ("POST".equals(method) &&
                (path.equals("/payments") || path.equals("/payments/create-order"))) {
            String secret = request.getHeader("X-Internal-Secret");
            if (internalSecret.equals(secret)) {
                return true;
            }
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthorized internal call");
            return false;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Missing or invalid Authorization header");
            return false;
        }

        String token = authHeader.substring(7);

        try {
            String role   = jwtUtil.extractRole(token);
            Long   userId = jwtUtil.extractUserId(token);
            request.setAttribute("role", role);
            request.setAttribute("userId", userId);
            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid or expired token");
            return false;
        }
    }
}
