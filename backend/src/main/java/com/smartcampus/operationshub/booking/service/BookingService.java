package com.smartcampus.operationshub.booking.service;

import com.smartcampus.operationshub.booking.dto.BookingApprovalRequest;
import com.smartcampus.operationshub.booking.dto.BookingCancellationRequest;
import com.smartcampus.operationshub.booking.dto.BookingCreateRequest;
import com.smartcampus.operationshub.booking.dto.BookingRejectionRequest;
import com.smartcampus.operationshub.booking.dto.BookingResponse;
import com.smartcampus.operationshub.booking.entity.BookingStatus;
import java.time.LocalDate;
import java.util.List;

public interface BookingService {

    BookingResponse createBookingRequest(BookingCreateRequest request, String username);

    List<BookingResponse> getOwnBookings(String username);

    BookingResponse getBookingById(String bookingId, String username, boolean isAdmin);

    /**
     * Returns all bookings for admin view with optional filters.
     * Pass null for any filter to skip it.
     */
    List<BookingResponse> getAllBookingsForAdmin(BookingStatus status, String resourceId,
            LocalDate bookingDate, String requestedBy);

    BookingResponse approveBooking(String bookingId, BookingApprovalRequest request, String adminUsername);

    BookingResponse rejectBooking(String bookingId, BookingRejectionRequest request, String adminUsername);

    BookingResponse cancelBooking(String bookingId, BookingCancellationRequest request, String username,
            boolean isAdmin);

    void deletePendingBooking(String bookingId, String username, boolean isAdmin);
}
