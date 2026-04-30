package com.cliauth.service;

import com.cliauth.model.Facility;
import com.cliauth.dto.CreateFacilityDTO;
import com.cliauth.dto.UpdateFacilityDTO;
import com.cliauth.dto.FacilityResponseDTO;
import com.cliauth.mapper.FacilityMapper;
import com.cliauth.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final FacilityMapper facilityMapper;

    public FacilityService(FacilityRepository facilityRepository, FacilityMapper facilityMapper) {
        this.facilityRepository = facilityRepository;
        this.facilityMapper = facilityMapper;
    }

    /**
     * CREATE - Add a new facility
     */
    public FacilityResponseDTO createFacility(CreateFacilityDTO createDTO) {
        Facility facility = facilityMapper.toFacility(createDTO);
        Facility savedFacility = facilityRepository.save(facility);
        return facilityMapper.toResponseDTO(savedFacility);
    }

    /**
     * READ - Get all facilities
     */
    public List<FacilityResponseDTO> getAllFacilities() {
        return facilityRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(facilityMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * READ - Get facility by ID
     */
    public Optional<FacilityResponseDTO> getFacilityById(String id) {
        return facilityRepository.findById(id)
                .map(facilityMapper::toResponseDTO);
    }

    /**
     * READ - Get facilities by status
     */
    public List<FacilityResponseDTO> getFacilitiesByStatus(String status) {
        return facilityRepository.findByStatus(status)
                .stream()
                .map(facilityMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * READ - Get active facilities only
     */
    public List<FacilityResponseDTO> getActiveFacilities() {
        return getFacilitiesByStatus("ACTIVE");
    }

    /**
     * READ - Get facilities by type
     */
    public List<FacilityResponseDTO> getFacilitiesByType(String type) {
        return facilityRepository.findByType(type)
                .stream()
                .map(facilityMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * READ - Get facilities created by specific user
     */
    public List<FacilityResponseDTO> getFacilitiesByCreatedBy(String createdBy) {
        return facilityRepository.findByCreatedBy(createdBy)
                .stream()
                .map(facilityMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * UPDATE - Update facility details
     */
    public Optional<FacilityResponseDTO> updateFacility(String id, UpdateFacilityDTO updateDTO) {
        return facilityRepository.findById(id).map(facility -> {
            facilityMapper.updateFacilityFromDTO(updateDTO, facility);
            facility.setUpdatedAt(LocalDateTime.now());
            Facility updatedFacility = facilityRepository.save(facility);
            return facilityMapper.toResponseDTO(updatedFacility);
        });
    }

    /**
     * DELETE - Delete facility by ID
     */
    public boolean deleteFacility(String id) {
        if (facilityRepository.existsById(id)) {
            facilityRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * UTILITY - Check if facility exists
     */
    public boolean facilityExists(String id) {
        return facilityRepository.existsById(id);
    }

    /**
     * UTILITY - Get facility count
     */
    public long getFacilityCount() {
        return facilityRepository.count();
    }

    /**
     * UTILITY - Get count by status
     */
    public long getFacilityCountByStatus(String status) {
        return facilityRepository.findByStatus(status).size();
    }
}
