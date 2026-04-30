package com.cliauth.mapper;

import com.cliauth.model.Facility;
import com.cliauth.dto.CreateFacilityDTO;
import com.cliauth.dto.UpdateFacilityDTO;
import com.cliauth.dto.FacilityResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class FacilityMapper {

    /**
     * Convert CreateFacilityDTO to Facility entity
     */
    public Facility toFacility(CreateFacilityDTO dto) {
        if (dto == null) {
            return null;
        }
        return new Facility(
            dto.getName(),
            dto.getType(),
            dto.getLocation(),
            dto.getCapacity(),
            dto.getStatus(),
            dto.getDescription(),
            dto.getImage(),
            dto.getCreatedBy()
        );
    }

    /**
     * Convert Facility entity to FacilityResponseDTO
     */
    public FacilityResponseDTO toResponseDTO(Facility facility) {
        if (facility == null) {
            return null;
        }
        return new FacilityResponseDTO(
            facility.getId(),
            facility.getName(),
            facility.getType(),
            facility.getLocation(),
            facility.getCapacity(),
            facility.getStatus(),
            facility.getDescription(),
            facility.getImage(),
            facility.getCreatedBy(),
            facility.getCreatedAt(),
            facility.getUpdatedAt()
        );
    }

    /**
     * Update Facility entity from UpdateFacilityDTO
     */
    public void updateFacilityFromDTO(UpdateFacilityDTO dto, Facility facility) {
        if (dto == null || facility == null) {
            return;
        }
        if (dto.getName() != null) {
            facility.setName(dto.getName());
        }
        if (dto.getType() != null) {
            facility.setType(dto.getType());
        }
        if (dto.getLocation() != null) {
            facility.setLocation(dto.getLocation());
        }
        if (dto.getCapacity() != null) {
            facility.setCapacity(dto.getCapacity());
        }
        if (dto.getStatus() != null) {
            facility.setStatus(dto.getStatus());
        }
        if (dto.getDescription() != null) {
            facility.setDescription(dto.getDescription());
        }
        if (dto.getImage() != null) {
            facility.setImage(dto.getImage());
        }
    }
}
