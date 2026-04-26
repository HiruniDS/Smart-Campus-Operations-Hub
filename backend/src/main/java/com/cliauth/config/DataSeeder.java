package com.cliauth.config;

import com.cliauth.model.User;
import com.cliauth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed Admin
        seedUser("Admin User", "admin@smartcampus.edu", "password", "ADMIN");
        
        // Seed Technician
        seedUser("Maintenance Tech", "tech@smartcampus.edu", "password", "TECHNICIAN");
        
        // Seed regular User
        seedUser("Smart User", "user@smartcampus.edu", "password", "USER");
        
        System.out.println("Data Seeding Completed Successfully");
    }

    private void seedUser(String name, String email, String password, String role) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setAuthProvider("LOCAL");
            user.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=" + name);
            userRepository.save(user);
        }
    }
}
