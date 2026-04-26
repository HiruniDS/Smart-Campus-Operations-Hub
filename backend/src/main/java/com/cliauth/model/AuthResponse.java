package com.cliauth.model;

public class AuthResponse {
    private String token;
    private User user;
    private String status;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, User user, String status, String message) {
        this.token = token;
        this.user = user;
        this.status = status;
        this.message = message;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    // Manual Builder
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private User user;
        private String status;
        private String message;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder user(User user) { this.user = user; return this; }
        public AuthResponseBuilder status(String status) { this.status = status; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, user, status, message);
        }
    }
}
