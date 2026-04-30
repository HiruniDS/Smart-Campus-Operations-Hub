package com.cliauth.controller;

import com.cliauth.model.AuthResponse;
import com.cliauth.model.LoginRequest;
import com.cliauth.model.SignupRequest;
import com.cliauth.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.register(request);
            if ("error".equals(response.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder().status("error").message("Internal Server Error: " + e.getMessage()).build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            if ("error".equals(response.getStatus())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.builder().status("error").message("Internal Server Error: " + e.getMessage()).build());
        }
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> googleData) {
        String email = googleData.get("email");
        String name = googleData.get("name");
        String avatar = googleData.get("avatar");

        if (email == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    AuthResponse.builder().status("error").message("Email is required").build()
            );
        }

        AuthResponse response = authService.googleLogin(email, name, avatar);
        return ResponseEntity.ok(response);
    }
}
