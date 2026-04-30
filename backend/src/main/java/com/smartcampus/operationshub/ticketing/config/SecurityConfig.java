package com.smartcampus.operationshub.ticketing.config;

/**
 * Security for the ticketing/booking modules is now handled by the unified
 * {@link com.cliauth.config.SecurityConfig} in the cliauth module.
 *
 * This class is intentionally left empty to avoid duplicate bean definitions
 * (PasswordEncoder, SecurityFilterChain, UserDetailsService,
 * CorsConfigurationSource)
 * that would conflict when both modules run in the same application context.
 */
public class SecurityConfig {
}
