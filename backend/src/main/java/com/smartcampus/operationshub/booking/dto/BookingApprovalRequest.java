package com.smartcampus.operationshub.booking.dto;

import jakarta.validation.constraints.Size;

public class BookingApprovalRequest {

    @Size(max = 500, message = "Review reason cannot exceed 500 characters")
    private String reviewReason;

    public String getReviewReason() {
        return reviewReason;
    }

    public void setReviewReason(String reviewReason) {
        this.reviewReason = reviewReason;
    }
}
