package com.cliauth.service;

import com.cliauth.model.Notice;
import com.cliauth.model.User;
import com.cliauth.repository.NoticeRepository;
import com.cliauth.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public NoticeService(NoticeRepository noticeRepository, UserRepository userRepository, NotificationService notificationService) {
        this.noticeRepository = noticeRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Notice publishNotice(String title, String content, String adminId) {
        // 1. Save the notice
        Notice notice = new Notice(title, content, adminId);
        Notice savedNotice = noticeRepository.save(notice);

        // 2. Blast notification to all Students (USER role)
        List<User> students = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase("USER"))
                .toList();

        System.out.println("[DEBUG] Notice Broadcast: Found " + students.size() + " students to notify.");

        for (User student : students) {
            try {
                notificationService.createNotification(
                    student.getId(),
                    "New Campus Notice: " + title,
                    content,
                    "INFO"
                );
            } catch (Exception e) {
                System.err.println("[ERROR] Failed to notify student " + student.getId() + ": " + e.getMessage());
            }
        }

        return savedNotice;
    }

    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByCreatedAtDesc();
    }
}
