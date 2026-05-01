package com.cliauth.controller;

import com.cliauth.dto.CreateFacilityDTO;
import com.cliauth.dto.UpdateFacilityDTO;
import com.cliauth.dto.FacilityResponseDTO;
import com.cliauth.service.FacilityService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    /**
     * CREATE - Add a new facility
     * POST /api/facilities
     * Requires ADMIN or TECHNICIAN role
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<FacilityResponseDTO> createFacility(@Valid @RequestBody CreateFacilityDTO createDTO) {
        try {
            FacilityResponseDTO facility = facilityService.createFacility(createDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(facility);
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to create facility: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * READ - Get all facilities
     * GET /api/facilities
     */
    @GetMapping
    public ResponseEntity<List<FacilityResponseDTO>> getAllFacilities() {
        List<FacilityResponseDTO> facilities = facilityService.getAllFacilities();
        return ResponseEntity.ok(facilities);
    }

    /**
     * READ - Get active facilities only
     * GET /api/facilities/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<FacilityResponseDTO>> getActiveFacilities() {
        List<FacilityResponseDTO> facilities = facilityService.getActiveFacilities();
        return ResponseEntity.ok(facilities);
    }

    /**
     * READ - Get facility by ID
     * GET /api/facilities/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FacilityResponseDTO> getFacilityById(@PathVariable String id) {
        return facilityService.getFacilityById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * READ - Get facilities by status
     * GET /api/facilities/by-status/{status}
     */
    @GetMapping("/by-status/{status}")
    public ResponseEntity<List<FacilityResponseDTO>> getFacilitiesByStatus(@PathVariable String status) {
        List<FacilityResponseDTO> facilities = facilityService.getFacilitiesByStatus(status);
        return ResponseEntity.ok(facilities);
    }

    /**
     * READ - Get facilities by type
     * GET /api/facilities/by-type/{type}
     */
    @GetMapping("/by-type/{type}")
    public ResponseEntity<List<FacilityResponseDTO>> getFacilitiesByType(@PathVariable String type) {
        List<FacilityResponseDTO> facilities = facilityService.getFacilitiesByType(type);
        return ResponseEntity.ok(facilities);
    }

    /**
     * READ - Get facilities by creator
     * GET /api/facilities/created-by/{createdBy}
     */
    @GetMapping("/created-by/{createdBy}")
    public ResponseEntity<List<FacilityResponseDTO>> getFacilitiesByCreatedBy(@PathVariable String createdBy) {
        List<FacilityResponseDTO> facilities = facilityService.getFacilitiesByCreatedBy(createdBy);
        return ResponseEntity.ok(facilities);
    }

    /**
     * UPDATE - Update facility
     * PUT /api/facilities/{id}
     * Requires ADMIN or TECHNICIAN role
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<FacilityResponseDTO> updateFacility(
            @PathVariable String id,
            @Valid @RequestBody UpdateFacilityDTO updateDTO) {
        try {
            return facilityService.updateFacility(id, updateDTO)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            System.err.println("[ERROR] Failed to update facility: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * DELETE - Delete facility by ID
     * DELETE /api/facilities/{id}
     * Requires ADMIN role only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFacility(@PathVariable String id) {
        if (facilityService.deleteFacility(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * UTILITY - Check if facility exists
     * GET /api/facilities/{id}/exists
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<Map<String, Boolean>> facilityExists(@PathVariable String id) {
        boolean exists = facilityService.facilityExists(id);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * UTILITY - Get facility statistics
     * GET /api/facilities/meta/stats
     */
    @GetMapping("/meta/stats")
    public ResponseEntity<Map<String, Object>> getFacilityStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", facilityService.getFacilityCount());
        stats.put("active", facilityService.getFacilityCountByStatus("ACTIVE"));
        stats.put("outOfService", facilityService.getFacilityCountByStatus("OUT_OF_SERVICE"));
        return ResponseEntity.ok(stats);
    }
}
