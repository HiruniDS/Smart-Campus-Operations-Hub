package com.smartcampus.operationshub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Unified entry point for the Smart Campus Operations Hub.
 * Scans both the core operationshub modules (booking, ticketing) and
 * the cliauth module (auth, notifications, role management, OAuth2).
 */
@SpringBootApplication(scanBasePackages = { "com.smartcampus.operationshub", "com.cliauth" })
@EnableMongoRepositories(basePackages = { "com.smartcampus.operationshub", "com.cliauth" })
public class SmartCampusOperationsHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartCampusOperationsHubApplication.class, args);
    }
}
