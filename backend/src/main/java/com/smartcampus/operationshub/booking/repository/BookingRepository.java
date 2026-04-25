package com.smartcampus.operationshub.booking.repository;

import com.smartcampus.operationshub.booking.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    // Placeholder for future query methods, for example:
    // List<Booking> findByRequestedByOrderByCreatedAtDesc(String requestedBy);
    // List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
}
