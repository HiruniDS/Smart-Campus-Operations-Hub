package com.smartcampus.operationshub.ticketing.dto;

import com.smartcampus.operationshub.ticketing.entity.TicketStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequest {

    @NotNull(message = "Status is required")
    private TicketStatus status;

    public TicketStatus getStatus() {
        return status;
    }

    public void setStatus(TicketStatus status) {
        this.status = status;
    }
}
