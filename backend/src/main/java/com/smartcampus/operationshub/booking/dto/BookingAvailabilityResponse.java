package com.smartcampus.operationshub.booking.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BookingAvailabilityResponse {

    private String resourceId;
    private LocalDate bookingDate;
    private List<OccupiedTimeSlotResponse> occupiedSlots = new ArrayList<>();
    private boolean available;
    private String summary;

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public LocalDate getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDate bookingDate) {
        this.bookingDate = bookingDate;
    }

    public List<OccupiedTimeSlotResponse> getOccupiedSlots() {
        return occupiedSlots;
    }

    public void setOccupiedSlots(List<OccupiedTimeSlotResponse> occupiedSlots) {
        this.occupiedSlots = occupiedSlots;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
