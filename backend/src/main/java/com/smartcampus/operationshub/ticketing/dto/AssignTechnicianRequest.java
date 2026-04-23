package com.smartcampus.operationshub.ticketing.dto;

import jakarta.validation.constraints.NotBlank;

public class AssignTechnicianRequest {

    @NotBlank(message = "Technician username is required")
    private String technicianUsername;

    public String getTechnicianUsername() {
        return technicianUsername;
    }

    public void setTechnicianUsername(String technicianUsername) {
        this.technicianUsername = technicianUsername;
    }
}
