package com.cliauth.dto;

import jakarta.validation.constraints.Min;

public class UpdateFacilityDTO {
    private String name;
    private String type;
    private String location;
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
    private String status;
    private String description;
    private String image;

    // Constructors
    public UpdateFacilityDTO() {}

    public UpdateFacilityDTO(String name, String type, String location, Integer capacity, 
                            String status, String description, String image) {
        this.name = name;
        this.type = type;
        this.location = location;
        this.capacity = capacity;
        this.status = status;
        this.description = description;
        this.image = image;
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
}
