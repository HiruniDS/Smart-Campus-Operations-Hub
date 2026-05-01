package com.cliauth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

public class CreateFacilityDTO {
    @NotBlank(message = "Facility name is required")
    private String name;

    @NotBlank(message = "Facility type is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "Description is required")
    private String description;

    private String image;

    @NotBlank(message = "Created by is required")
    private String createdBy;

    // Constructors
    public CreateFacilityDTO() {}

    public CreateFacilityDTO(String name, String type, String location, Integer capacity, 
                            String status, String description, String image, String createdBy) {
        this.name = name;
        this.type = type;
        this.location = location;
        this.capacity = capacity;
        this.status = status;
        this.description = description;
        this.image = image;
        this.createdBy = createdBy;
    }

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
