package com.smartcampus.operationshub.booking.service.impl;

import com.smartcampus.operationshub.booking.dto.BookingApprovalRequest;
import com.smartcampus.operationshub.booking.dto.BookingCancellationRequest;
import com.smartcampus.operationshub.booking.dto.BookingCreateRequest;
import com.smartcampus.operationshub.booking.dto.BookingRejectionRequest;
import com.smartcampus.operationshub.booking.dto.BookingResponse;
import com.smartcampus.operationshub.booking.entity.Booking;
import com.smartcampus.operationshub.booking.entity.BookingStatus;
import com.smartcampus.operationshub.booking.repository.BookingRepository;
import com.smartcampus.operationshub.booking.service.BookingService;
import com.smartcampus.operationshub.ticketing.exception.BadRequestException;
import com.smartcampus.operationshub.ticketing.exception.ForbiddenException;
import com.smartcampus.operationshub.ticketing.exception.ResourceNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // -------------------------------------------------------------------------
    // 1. Create booking request
    // -------------------------------------------------------------------------

    @Override
    public BookingResponse createBookingRequest(BookingCreateRequest request, String username) {

        // Reject bookings for dates in the past
        if (request.getBookingDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Booking date cannot be in the past");
        }

        // Reject invalid time ranges where end time is not strictly after start time
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        // Check for scheduling conflicts with existing active bookings
        checkForConflict(request.getResourceId(), request.getBookingDate(),
                request.getStartTime(), request.getEndTime(), null);

        Booking booking = new Booking();
        booking.setResourceId(request.getResourceId());
        booking.setResourceName(request.getResourceName());
        booking.setResourceType(request.getResourceType());
        booking.setLocation(request.getLocation());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setRequestedBy(username);
        booking.setStatus(BookingStatus.PENDING); // always starts as PENDING
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return toResponse(bookingRepository.save(booking));
    }

    // -------------------------------------------------------------------------
    // 2. Booking retrieval
    // -------------------------------------------------------------------------

    @Override
    public List<BookingResponse> getOwnBookings(String username) {
        return bookingRepository.findByRequestedByOrderByCreatedAtDesc(username)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookingResponse getBookingById(String bookingId, String username, boolean isAdmin) {
        Booking booking = getBookingOrThrow(bookingId);

        // Users can only view their own bookings; admins can view any booking
        if (!isAdmin && !booking.getRequestedBy().equals(username)) {
            throw new ForbiddenException("You are not allowed to access this booking");
        }

        return toResponse(booking);
    }

    @Override
    public List<BookingResponse> getAllBookingsForAdmin(BookingStatus status, String resourceId,
            LocalDate bookingDate, String requestedBy) {

        return bookingRepository.findAll().stream()
                .filter(b -> status == null || b.getStatus() == status)
                .filter(b -> resourceId == null || resourceId.isBlank() || b.getResourceId().equals(resourceId))
                .filter(b -> bookingDate == null || b.getBookingDate().equals(bookingDate))
                .filter(b -> requestedBy == null || requestedBy.isBlank() || b.getRequestedBy().equals(requestedBy))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    // -------------------------------------------------------------------------
    // 3. Booking workflow
    // -------------------------------------------------------------------------

    @Override
    public BookingResponse approveBooking(String bookingId, BookingApprovalRequest request, String adminUsername) {
        Booking booking = getBookingOrThrow(bookingId);

        // Only PENDING bookings can be approved
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        // Re-check scheduling conflict before finalising approval.
        // We exclude this booking's own id so it does not conflict with itself.
        checkForConflict(booking.getResourceId(), booking.getBookingDate(),
                booking.getStartTime(), booking.getEndTime(), bookingId);

        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(adminUsername);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setReviewReason(request.getReviewReason());
        booking.setUpdatedAt(LocalDateTime.now());

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse rejectBooking(String bookingId, BookingRejectionRequest request, String adminUsername) {
        Booking booking = getBookingOrThrow(bookingId);

        // Only PENDING bookings can be rejected
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedBy(adminUsername);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setReviewReason(request.getReason());
        booking.setUpdatedAt(LocalDateTime.now());

        return toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse cancelBooking(String bookingId, BookingCancellationRequest request,
            String username, boolean isAdmin) {
        Booking booking = getBookingOrThrow(bookingId);

        // Only the booking owner or an admin can cancel
        if (!isAdmin && !booking.getRequestedBy().equals(username)) {
            throw new ForbiddenException("You are not allowed to cancel this booking");
        }

        // Only PENDING or APPROVED bookings can be cancelled
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException(
                    "Only PENDING or APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledBy(username);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancellationReason(request.getReason());
        booking.setUpdatedAt(LocalDateTime.now());

        return toResponse(bookingRepository.save(booking));
    }

    // -------------------------------------------------------------------------
    // 4. Delete
    // -------------------------------------------------------------------------

    @Override
    public void deletePendingBooking(String bookingId, String username, boolean isAdmin) {
        Booking booking = getBookingOrThrow(bookingId);

        // Only the booking owner or an admin can delete
        if (!isAdmin && !booking.getRequestedBy().equals(username)) {
            throw new ForbiddenException("You are not allowed to delete this booking");
        }

        // Can only delete while the booking is still PENDING
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only PENDING bookings can be deleted. Current status: " + booking.getStatus());
        }

        bookingRepository.delete(booking);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Finds a booking by id or throws a 404-style exception.
     */
    private Booking getBookingOrThrow(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }

    /**
     * Checks whether the requested time slot overlaps with any existing active
     * booking for the same resource on the same date.
     *
     * Only PENDING and APPROVED bookings are treated as active (blocking).
     * REJECTED and CANCELLED bookings are ignored.
     *
     * Overlap condition (standard interval intersection):
     * existing.startTime < requestedEndTime AND existing.endTime >
     * requestedStartTime
     *
     * @param excludeBookingId – the id of the booking to skip during the check
     *                         (used when re-checking during approval so a booking
     *                         does not conflict with itself).
     */
    private void checkForConflict(String resourceId, LocalDate bookingDate,
            LocalTime startTime, LocalTime endTime, String excludeBookingId) {

        List<BookingStatus> activeStatuses = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

        List<Booking> existingBookings = bookingRepository
                .findByResourceIdAndBookingDateAndStatusIn(resourceId, bookingDate, activeStatuses);

        for (Booking existing : existingBookings) {

            // Skip the booking currently being approved (it is already stored as PENDING)
            if (excludeBookingId != null && existing.getId().equals(excludeBookingId)) {
                continue;
            }

            boolean overlaps = existing.getStartTime().isBefore(endTime)
                    && existing.getEndTime().isAfter(startTime);

            if (overlaps) {
                throw new BadRequestException(
                        "Scheduling conflict: this resource is already booked from "
                                + existing.getStartTime() + " to " + existing.getEndTime()
                                + " on " + bookingDate);
            }
        }
    }

    /**
     * Maps a Booking entity to a BookingResponse DTO.
     */
    private BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setResourceId(booking.getResourceId());
        response.setResourceName(booking.getResourceName());
        response.setResourceType(booking.getResourceType());
        response.setLocation(booking.getLocation());
        response.setBookingDate(booking.getBookingDate());
        response.setStartTime(booking.getStartTime());
        response.setEndTime(booking.getEndTime());
        response.setPurpose(booking.getPurpose());
        response.setExpectedAttendees(booking.getExpectedAttendees());
        response.setRequestedBy(booking.getRequestedBy());
        response.setStatus(booking.getStatus());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        response.setReviewedBy(booking.getReviewedBy());
        response.setReviewedAt(booking.getReviewedAt());
        response.setReviewReason(booking.getReviewReason());
        response.setCancelledBy(booking.getCancelledBy());
        response.setCancelledAt(booking.getCancelledAt());
        response.setCancellationReason(booking.getCancellationReason());
        return response;
    }
}
