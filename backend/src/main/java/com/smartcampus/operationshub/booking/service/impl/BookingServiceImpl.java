package com.smartcampus.operationshub.booking.service.impl;

import com.smartcampus.operationshub.booking.dto.BookingApprovalRequest;
import com.smartcampus.operationshub.booking.dto.BookingCancellationRequest;
import com.smartcampus.operationshub.booking.dto.BookingCreateRequest;
import com.smartcampus.operationshub.booking.dto.BookingRejectionRequest;
import com.smartcampus.operationshub.booking.dto.BookingResponse;
import com.smartcampus.operationshub.booking.service.BookingService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    @Override
    public BookingResponse createBookingRequest(BookingCreateRequest request, String username) {
        throw new UnsupportedOperationException("Booking creation logic is not implemented yet");
    }

    @Override
    public List<BookingResponse> getOwnBookings(String username) {
        throw new UnsupportedOperationException("Get own bookings logic is not implemented yet");
    }

    @Override
    public BookingResponse getBookingById(String bookingId, String username, boolean isAdmin) {
        throw new UnsupportedOperationException("Get booking by id logic is not implemented yet");
    }

    @Override
    public List<BookingResponse> getAllBookingsForAdmin() {
        throw new UnsupportedOperationException("Get all bookings for admin logic is not implemented yet");
    }

    @Override
    public BookingResponse approveBooking(String bookingId, BookingApprovalRequest request, String adminUsername) {
        throw new UnsupportedOperationException("Approve booking logic is not implemented yet");
    }

    @Override
    public BookingResponse rejectBooking(String bookingId, BookingRejectionRequest request, String adminUsername) {
        throw new UnsupportedOperationException("Reject booking logic is not implemented yet");
    }

    @Override
    public BookingResponse cancelBooking(String bookingId, BookingCancellationRequest request, String username,
            boolean isAdmin) {
        throw new UnsupportedOperationException("Cancel booking logic is not implemented yet");
    }

    @Override
    public void deletePendingBooking(String bookingId, String username, boolean isAdmin) {
        throw new UnsupportedOperationException("Delete pending booking logic is not implemented yet");
    }
}
