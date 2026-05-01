package com.cliauth.config;

import com.cliauth.model.User;
import com.cliauth.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;

    public OAuth2SuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatar = oAuth2User.getAttribute("picture");

        // Try to get the intended role from cookie
        String role = "USER"; // Default
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("intended_role".equals(cookie.getName())) {
                    role = cookie.getValue();
                    break;
                }
            }
        }

        // Find or Create user in database
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Optional: Update role if it's a new login attempt with a different role?
            // Usually, we keep the existing role, but for this project's testing,
            // the user might want to switch roles.
            if (!user.getRole().equals(role)) {
                user.setRole(role);
                userRepository.save(user);
            }
        } else {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setRole(role);
            user.setAuthProvider("GOOGLE");
            user.setAvatar(avatar);
            user = userRepository.save(user);
        }

        // Redirect back to frontend with user info
        String token = "token-" + UUID.randomUUID().toString();
        user.setToken(token);
        userRepository.save(user);

        String targetUrl = UriComponentsBuilder.fromUriString("http://localhost:3000/dashboard")
                .queryParam("id", user.getId())
                .queryParam("email", user.getEmail())
                .queryParam("name", user.getName())
                .queryParam("role", user.getRole())
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
