package com.cliauth.service;

import com.cliauth.model.User;
import com.cliauth.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class TicketService {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public TicketService(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // Triggered when an Admin assigns a ticket to a technician
    public void assignTicket(String ticketId, String technicianId, String adminName) {
        // In a real app, you would update the ticket in DB here.
        notificationService.createNotification(
            technicianId,
            "New Ticket Assigned",
            "Admin " + adminName + " assigned ticket #" + ticketId + " to you.",
            "INFO"
        );
    }

    // Triggered when a Technician completes a ticket
    public void completeTicket(String ticketId, String technicianName) {
        // Notify all Admins that a ticket is finished
        userRepository.findAll().stream()
            .filter(u -> "ADMIN".equals(u.getRole()))
            .forEach(admin -> {
                notificationService.createNotification(
                    admin.getId(),
                    "Ticket Completed",
                    "Technician " + technicianName + " has finished ticket #" + ticketId + ".",
                    "SUCCESS"
                );
            });
    }
}
