package com.smartcampus.operationshub.ticketing.controller;

import com.smartcampus.operationshub.ticketing.dto.AssignTechnicianRequest;
import com.smartcampus.operationshub.ticketing.dto.CommentCreateRequest;
import com.smartcampus.operationshub.ticketing.dto.TicketCreateRequest;
import com.smartcampus.operationshub.ticketing.dto.TicketResponse;
import com.smartcampus.operationshub.ticketing.dto.TicketUpdateRequest;
import com.smartcampus.operationshub.ticketing.dto.UpdateStatusRequest;
import com.smartcampus.operationshub.ticketing.entity.TicketPriority;
import com.smartcampus.operationshub.ticketing.entity.TicketStatus;
import com.smartcampus.operationshub.ticketing.service.TicketService;
import jakarta.validation.Valid;
import java.util.List;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketCreateRequest request,
                                                       Authentication authentication) {
        TicketResponse created = ticketService.createTicket(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<List<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            Authentication authentication) {

        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isTechnician = hasRole(authentication, "ROLE_TECHNICIAN");

        return ResponseEntity.ok(ticketService.getTickets(
                status,
                priority,
                authentication.getName(),
                isAdmin,
                isTechnician));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable String id, Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isTechnician = hasRole(authentication, "ROLE_TECHNICIAN");

        return ResponseEntity.ok(ticketService.getTicketById(id, authentication.getName(), isAdmin, isTechnician));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<TicketResponse> updateTicket(@PathVariable String id,
                                                       @Valid @RequestBody TicketUpdateRequest request,
                                                       Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        return ResponseEntity.ok(ticketService.updateTicket(id, request, authentication.getName(), isAdmin));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id, Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        ticketService.deleteTicket(id, authentication.getName(), isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignTechnician(@PathVariable String id,
                                                           @Valid @RequestBody AssignTechnicianRequest request) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, request));
    }

    @PostMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable String id,
                                                       @Valid @RequestBody UpdateStatusRequest request,
                                                       Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isTechnician = hasRole(authentication, "ROLE_TECHNICIAN");
        return ResponseEntity.ok(ticketService.updateStatus(id, request, authentication.getName(), isAdmin, isTechnician));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketResponse> addComment(@PathVariable String id,
                                                     @Valid @RequestBody CommentCreateRequest request,
                                                     Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isTechnician = hasRole(authentication, "ROLE_TECHNICIAN");
        return ResponseEntity.ok(ticketService.addComment(id, request, authentication.getName(), isAdmin, isTechnician));
    }

    @PostMapping("/{id}/attachments")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<TicketResponse> addAttachments(@PathVariable String id,
                                                         @RequestParam("files") List<MultipartFile> files,
                                                         Authentication authentication) {
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isTechnician = hasRole(authentication, "ROLE_TECHNICIAN");
        return ResponseEntity.ok(ticketService.addAttachments(id, files, authentication.getName(), isAdmin, isTechnician));
    }

    @GetMapping("/{id}/attachments/{attachmentId}")
    @PreAuthorize("hasAnyRole('USER','ADMIN','TECHNICIAN')")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable String id,
                                                       @PathVariable String attachmentId) {
        Resource resource = ticketService.downloadAttachment(id, attachmentId);
        String contentType = "application/octet-stream";
        try {
            String probed = Files.probeContentType(Paths.get(resource.getURI()));
            if (probed != null) contentType = probed;
        } catch (IOException e) {
            // fall back to octet-stream
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals(role));
    }
}
