package com.cliauth.controller;

import com.cliauth.model.Notification;
import com.cliauth.model.User;
import com.cliauth.repository.UserRepository;
import com.cliauth.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable String userId,
            Authentication authentication) {
        verifyNotificationAccess(userId, authentication);
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId));
    }

    @GetMapping("/{userId}/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadCount(@PathVariable String userId, Authentication authentication) {
        verifyNotificationAccess(userId, authentication);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PostMapping("/{userId}/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllRead(@PathVariable String userId, Authentication authentication) {
        verifyNotificationAccess(userId, authentication);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    private void verifyNotificationAccess(String userId, Authentication authentication) {
        if (authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()))) {
            return;
        }

        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Authenticated user not found"));

        if (!userId.equals(currentUser.getId())) {
            throw new AccessDeniedException("You cannot access another user's notifications");
        }
    }
}
