package com.smartcampus.operationshub.ticketing.service.impl;

import com.smartcampus.operationshub.ticketing.dto.AssignTechnicianRequest;
import com.smartcampus.operationshub.ticketing.dto.AttachmentResponse;
import com.smartcampus.operationshub.ticketing.dto.CommentCreateRequest;
import com.smartcampus.operationshub.ticketing.dto.CommentResponse;
import com.smartcampus.operationshub.ticketing.dto.TicketCreateRequest;
import com.smartcampus.operationshub.ticketing.dto.TicketResponse;
import com.smartcampus.operationshub.ticketing.dto.TicketUpdateRequest;
import com.smartcampus.operationshub.ticketing.dto.UpdateStatusRequest;
import com.smartcampus.operationshub.ticketing.entity.Attachment;
import com.smartcampus.operationshub.ticketing.entity.Comment;
import com.smartcampus.operationshub.ticketing.entity.Ticket;
import com.smartcampus.operationshub.ticketing.entity.TicketPriority;
import com.smartcampus.operationshub.ticketing.entity.TicketStatus;
import com.smartcampus.operationshub.ticketing.exception.BadRequestException;
import com.smartcampus.operationshub.ticketing.exception.ForbiddenException;
import com.smartcampus.operationshub.ticketing.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.ticketing.repository.TicketRepository;
import com.smartcampus.operationshub.ticketing.service.TicketService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class TicketServiceImpl implements TicketService {

    private static final int MAX_ATTACHMENTS = 3;

    private final TicketRepository ticketRepository;
    private final Path uploadPath;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            @Value("${app.upload.dir}") String uploadDir) {
        this.ticketRepository = ticketRepository;
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException ex) {
            throw new RuntimeException("Could not initialize upload directory", ex);
        }
    }

    @Override
    public TicketResponse createTicket(TicketCreateRequest request, String username) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setCreatedBy(username);
        ticket.setCreatedAt(LocalDateTime.now());
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public List<TicketResponse> getTickets(TicketStatus status, TicketPriority priority, String username, boolean isAdmin, boolean isTechnician) {
        if (isAdmin) {
            return ticketRepository.findAll()
                    .stream()
                .filter(ticket -> status == null || ticket.getStatus() == status)
                .filter(ticket -> priority == null || ticket.getPriority() == priority)
                    .map(this::toResponse)
                    .toList();
        }

        if (isTechnician) {
            return ticketRepository.findByAssignedToOrderByCreatedAtDesc(username)
                    .stream()
                    .filter(ticket -> status == null || ticket.getStatus() == status)
                    .filter(ticket -> priority == null || ticket.getPriority() == priority)
                    .map(this::toResponse)
                    .toList();
        }

        return ticketRepository.findByCreatedByOrderByCreatedAtDesc(username)
                .stream()
                .filter(ticket -> status == null || ticket.getStatus() == status)
                .filter(ticket -> priority == null || ticket.getPriority() == priority)
                .map(this::toResponse)
                .toList();
    }

    @Override
    public TicketResponse getTicketById(String ticketId, String username, boolean isAdmin, boolean isTechnician) {
        Ticket ticket = getTicket(ticketId);
        verifyCanView(ticket, username, isAdmin, isTechnician);
        return toResponse(ticket);
    }

    @Override
    public TicketResponse updateTicket(String ticketId, TicketUpdateRequest request, String username, boolean isAdmin) {
        Ticket ticket = getTicket(ticketId);
        if (!isAdmin && !ticket.getCreatedBy().equals(username)) {
            throw new ForbiddenException("You can update only your own tickets");
        }
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public void deleteTicket(String ticketId, String username, boolean isAdmin) {
        Ticket ticket = getTicket(ticketId);
        if (!isAdmin && !ticket.getCreatedBy().equals(username)) {
            throw new ForbiddenException("You can delete only your own tickets");
        }
        ticketRepository.delete(ticket);
    }

    @Override
    public TicketResponse assignTechnician(String ticketId, AssignTechnicianRequest request) {
        Ticket ticket = getTicket(ticketId);
        ticket.setAssignedTo(request.getTechnicianUsername());
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse updateStatus(String ticketId, UpdateStatusRequest request, String username, boolean isAdmin, boolean isTechnician) {
        Ticket ticket = getTicket(ticketId);

        if (isTechnician && !username.equals(ticket.getAssignedTo())) {
            throw new ForbiddenException("Technicians can update only assigned tickets");
        }

        TicketStatus nextStatus = request.getStatus();
        if (!isValidTransition(ticket.getStatus(), nextStatus)) {
            throw new BadRequestException("Invalid status transition from " + ticket.getStatus() + " to " + nextStatus);
        }

        ticket.setStatus(nextStatus);
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse addComment(String ticketId, CommentCreateRequest request, String username, boolean isAdmin, boolean isTechnician) {
        Ticket ticket = getTicket(ticketId);
        verifyCanView(ticket, username, isAdmin, isTechnician);

        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setContent(request.getContent());
        comment.setAuthor(username);
        comment.setCreatedAt(LocalDateTime.now());

        ticket.getComments().add(comment);
        return toResponse(ticketRepository.save(ticket));
    }

    @Override
    public TicketResponse addAttachments(String ticketId, List<MultipartFile> files, String username, boolean isAdmin, boolean isTechnician) {
        Ticket ticket = getTicket(ticketId);
        verifyCanView(ticket, username, isAdmin, isTechnician);

        if (files == null || files.isEmpty()) {
            throw new BadRequestException("At least one file is required");
        }

        int existingAttachmentCount = ticket.getAttachments().size();
        if (existingAttachmentCount + files.size() > MAX_ATTACHMENTS) {
            throw new BadRequestException("A ticket can only have up to 3 attachments");
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                throw new BadRequestException("Empty files are not allowed");
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new BadRequestException("Only image files are allowed");
            }

            String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = uploadPath.resolve(storedName);

            try {
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ex) {
                throw new BadRequestException("Failed to store file: " + file.getOriginalFilename());
            }

            Attachment attachment = new Attachment();
            attachment.setId(UUID.randomUUID().toString());
            attachment.setFileName(file.getOriginalFilename());
            attachment.setFilePath(target.toString());
            ticket.getAttachments().add(attachment);
        }

        return toResponse(ticketRepository.save(ticket));
    }

    private Ticket getTicket(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + ticketId));
    }

    private void verifyCanView(Ticket ticket, String username, boolean isAdmin, boolean isTechnician) {
        if (isAdmin) {
            return;
        }

        if (isTechnician && username.equals(ticket.getAssignedTo())) {
            return;
        }

        if (!ticket.getCreatedBy().equals(username)) {
            throw new ForbiddenException("You are not allowed to access this ticket");
        }
    }

    private boolean isValidTransition(TicketStatus current, TicketStatus next) {
        if (current == next) {
            return true;
        }

        return switch (current) {
            case OPEN -> Set.of(TicketStatus.IN_PROGRESS, TicketStatus.REJECTED).contains(next);
            case IN_PROGRESS -> Set.of(TicketStatus.RESOLVED, TicketStatus.REJECTED).contains(next);
            case RESOLVED -> Set.of(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS).contains(next);
            case CLOSED, REJECTED -> false;
        };
    }

    private TicketResponse toResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setCategory(ticket.getCategory());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setCreatedBy(ticket.getCreatedBy());
        response.setAssignedTo(ticket.getAssignedTo());
        response.setCreatedAt(ticket.getCreatedAt());

        List<CommentResponse> comments = ticket.getComments().stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
        response.setComments(comments);

        List<AttachmentResponse> attachments = ticket.getAttachments().stream()
                .map(this::toAttachmentResponse)
                .collect(Collectors.toList());
        response.setAttachments(attachments);

        return response;
    }

    private CommentResponse toCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setAuthor(comment.getAuthor());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }

    private AttachmentResponse toAttachmentResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFilePath(attachment.getFilePath());
        return response;
    }
}
