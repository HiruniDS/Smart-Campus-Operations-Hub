package com.smartcampus.operationshub.booking.dto;

import com.smartcampus.operationshub.booking.entity.BookingStatus;
import java.time.LocalTime;

public class OccupiedTimeSlotResponse {

    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
