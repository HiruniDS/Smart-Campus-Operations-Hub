package com.cliauth.service;

import org.springframework.stereotype.Service;

@Service
public class BookingService {

    private final NotificationService notificationService;

    public BookingService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void approveBooking(String bookingId, String userId, String facilityName) {
        // In a real app, you would update booking status in DB here.
        notificationService.createNotification(
            userId,
            "Booking Approved",
            "Your booking for " + facilityName + " has been APPROVED.",
            "SUCCESS"
        );
    }

    public void rejectBooking(String bookingId, String userId, String facilityName, String reason) {
        notificationService.createNotification(
            userId,
            "Booking Rejected",
            "Your booking for " + facilityName + " was rejected. Reason: " + reason,
            "WARNING"
        );
    }
}
