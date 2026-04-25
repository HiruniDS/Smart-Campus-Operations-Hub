package com.smartcampus.operationshub.booking.repository;

import com.smartcampus.operationshub.booking.entity.Booking;
import com.smartcampus.operationshub.booking.entity.BookingStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Returns all bookings made by a specific user, newest first.
     * Used for the "my bookings" view.
     */
    List<Booking> findByRequestedByOrderByCreatedAtDesc(String requestedBy);

    /**
     * Returns all active bookings for a specific resource on a specific date,
     * filtered by a list of statuses. Used for scheduling conflict detection.
     * Only PENDING and APPROVED bookings block new requests.
     */
    List<Booking> findByResourceIdAndBookingDateAndStatusIn(
            String resourceId, LocalDate bookingDate, List<BookingStatus> statuses);
}
