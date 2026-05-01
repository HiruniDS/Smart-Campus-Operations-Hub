package com.cliauth.service;

import com.cliauth.model.AuthResponse;
import com.cliauth.model.LoginRequest;
import com.cliauth.model.SignupRequest;
import com.cliauth.model.User;
import com.cliauth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.builder()
                    .status("error")
                    .message("Email already in use")
                    .build();
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : "USER");
        user.setAuthProvider("LOCAL");
        user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.getName());

        User savedUser = userRepository.save(user);

        String token = generateToken();
        savedUser.setToken(token);
        userRepository.save(savedUser);

        return AuthResponse.builder()
                .status("success")
                .message("User registered successfully")
                .token(token)
                .user(savedUser)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            System.out.println("User not found in database");
            return AuthResponse.builder()
                    .status("error")
                    .message("Invalid email or password")
                    .build();
        }

        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword());
        System.out.println("Password match result: " + passwordMatches);

        if (!passwordMatches) {
            return AuthResponse.builder()
                    .status("error")
                    .message("Invalid email or password")
                    .build();
        }

        User u = userOpt.get();
        String token = generateToken();
        u.setToken(token);
        userRepository.save(u);

        return AuthResponse.builder()
                .status("success")
                .message("Login successful")
                .token(token)
                .user(u)
                .build();
    }

    public AuthResponse googleLogin(String email, String name, String avatar) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole("USER"); // Default role for social login
            user.setAuthProvider("GOOGLE");
            user.setAvatar(avatar);
            user = userRepository.save(user);
        }

        String token = generateToken();
        user.setToken(token);
        user = userRepository.save(user);

        return AuthResponse.builder()
                .status("success")
                .message("Google login successful")
                .token(token)
                .user(user)
                .build();
    }

    private String generateToken() {
        return "token-" + UUID.randomUUID().toString();
    }
}
