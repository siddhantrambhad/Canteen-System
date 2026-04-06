package com.example.order_service.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

//        String path   = request.getRequestURI();
//        String method = request.getMethod();
//
//        System.out.println(">>> OrderService Interceptor: " + method + " " + path);
//
//        // /payments is the MockPaymentController inside order-service
//        // order-service calls it via RestTemplate — no token in that call
//        if (path.contains("/payments")) {
//            return true;
//        }

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