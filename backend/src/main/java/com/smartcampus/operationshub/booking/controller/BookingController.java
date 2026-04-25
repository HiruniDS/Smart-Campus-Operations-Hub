package com.smartcampus.operationshub.booking.controller;

import com.smartcampus.operationshub.booking.dto.BookingApprovalRequest;
import com.smartcampus.operationshub.booking.dto.BookingCancellationRequest;
import com.smartcampus.operationshub.booking.dto.BookingCreateRequest;
import com.smartcampus.operationshub.booking.dto.BookingRejectionRequest;
import com.smartcampus.operationshub.booking.dto.BookingResponse;
import com.smartcampus.operationshub.booking.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingResponse> createBookingRequest(@Valid @RequestBody BookingCreateRequest request,
            Authentication authentication) {
        BookingResponse created = bookingService.createBookingRequest(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<List<BookingResponse>> getOwnBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getOwnBookings(authentication.getName()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id, Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        return ResponseEntity.ok(bookingService.getBookingById(id, authentication.getName(), isAdmin));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookingsForAdmin() {
        return ResponseEntity.ok(bookingService.getAllBookingsForAdmin());
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable String id,
            @Valid @RequestBody BookingApprovalRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.approveBooking(id, request, authentication.getName()));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable String id,
            @Valid @RequestBody BookingRejectionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request, authentication.getName()));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String id,
            @Valid @RequestBody BookingCancellationRequest request,
            Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        return ResponseEntity.ok(bookingService.cancelBooking(id, request, authentication.getName(), isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> deletePendingBooking(@PathVariable String id, Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        bookingService.deletePendingBooking(id, authentication.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(role));
    }
}
