package com.cliauth.repository;

import com.cliauth.model.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FacilityRepository extends MongoRepository<Facility, String> {
    List<Facility> findAllByOrderByCreatedAtDesc();
    List<Facility> findByStatus(String status);
    List<Facility> findByType(String type);
    List<Facility> findByCreatedBy(String createdBy);
}
