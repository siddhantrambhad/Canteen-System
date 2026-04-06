package com.canteen.authservice.service;

import com.canteen.authservice.config.JwtUtil;
import com.canteen.authservice.dto.LoginRequest;
import com.canteen.authservice.dto.LoginResponse;
import com.canteen.authservice.dto.RegisterRequest;
import com.canteen.authservice.model.User;
import com.canteen.authservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // BCryptPasswordEncoder from spring-security-crypto
    // Does NOT enable Spring Security — just password hashing
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Register a new employee
    // Any employee can self-register — they always get USER role
    // Admin is seeded via SQL separately
    public String register(RegisterRequest request) {

        // Check if email already exists — findAll() + for loop as per project rules
        List<User> allUsers = userRepository.findAll();

        for (User user : allUsers) {
            if (user.getEmail().equals(request.getEmail())) {
                throw new RuntimeException("Email already registered: " + request.getEmail());
            }
        }

        User newUser = new User();
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordEncoder.encode(request.getPassword())); // never store plain text
        newUser.setName(request.getName());
        newUser.setCompany(request.getCompany());
        // role and createdAt set by @PrePersist — always USER on registration

        userRepository.save(newUser);
        return "Registration successful. Please login.";
    }

    // Login with email and password
    // Returns JWT token if credentials are valid
    public LoginResponse login(LoginRequest request) {

        // Find user by email — findAll() + for loop
        List<User> allUsers = userRepository.findAll();
        User foundUser      = null;

        for (User user : allUsers) {
            if (user.getEmail().equals(request.getEmail())) {
                foundUser = user;
                break;
            }
        }

        // User not found
        if (foundUser == null) {
            throw new RuntimeException("No account found with this email. Please register first.");
        }

        // Wrong password
        if (!passwordEncoder.matches(request.getPassword(), foundUser.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }

        // Credentials valid — generate token
        String token = jwtUtil.generateToken(
            foundUser.getId(),
            foundUser.getEmail(),
            foundUser.getRole()
        );

        return new LoginResponse(
            token,
            foundUser.getId(),
            foundUser.getEmail(),
            foundUser.getName(),
            foundUser.getRole()
        );
    }
}