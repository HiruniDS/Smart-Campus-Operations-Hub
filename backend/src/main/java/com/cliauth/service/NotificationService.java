package com.cliauth.service;

import com.cliauth.model.Notification;
import com.cliauth.repository.NotificationRepository;
import com.cliauth.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void createNotification(String userId, String title, String message, String type) {
        Notification notification = new Notification(userId, title, message, type);
        notificationRepository.save(notification);
    }

    /**
     * Looks up the user by email (= Spring Security principal name used in
     * booking / ticketing modules) and creates a notification for that user.
     * Silently skips if no matching user exists.
     */
    public void createNotificationByEmail(String email, String title, String message, String type) {
        userRepository.findByEmail(email).ifPresent(user -> createNotification(user.getId(), title, message, type));
    }

    /**
     * Sends a notification to every user with the ADMIN role.
     */
    public void notifyAllAdmins(String title, String message, String type) {
        userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .forEach(admin -> createNotification(admin.getId(), title, message, type));
    }

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }
}
