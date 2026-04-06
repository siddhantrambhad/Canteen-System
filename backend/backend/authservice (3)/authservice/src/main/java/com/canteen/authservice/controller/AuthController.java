package com.canteen.authservice.controller;

import com.canteen.authservice.dto.LoginRequest;
import com.canteen.authservice.dto.LoginResponse;
import com.canteen.authservice.dto.RegisterRequest;
import com.canteen.authservice.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // Step 1 — New employee registers once
    // POST /auth/register
    // Body: { "email": "alice@techcorp.com", "password": "1234", "name": "Alice", "company": "TechCorp" }
    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    // Step 2 — Registered employee logs in
    // POST /auth/login
    // Body: { "email": "alice@techcorp.com", "password": "1234" }
    // Returns: { token, userId, email, name, role }
    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}