package com.smartcampus.operationshub.ticketing.service;

import com.smartcampus.operationshub.ticketing.dto.AssignTechnicianRequest;
import com.smartcampus.operationshub.ticketing.dto.CommentCreateRequest;
import com.smartcampus.operationshub.ticketing.dto.TicketCreateRequest;
import com.smartcampus.operationshub.ticketing.dto.TicketResponse;
import com.smartcampus.operationshub.ticketing.dto.TicketUpdateRequest;
import com.smartcampus.operationshub.ticketing.dto.UpdateStatusRequest;
import com.smartcampus.operationshub.ticketing.entity.TicketPriority;
import com.smartcampus.operationshub.ticketing.entity.TicketStatus;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface TicketService {

    TicketResponse createTicket(TicketCreateRequest request, String username);

    List<TicketResponse> getTickets(TicketStatus status, TicketPriority priority, String username, boolean isAdmin, boolean isTechnician);

    TicketResponse getTicketById(Long ticketId, String username, boolean isAdmin, boolean isTechnician);

    TicketResponse updateTicket(Long ticketId, TicketUpdateRequest request, String username, boolean isAdmin);

    void deleteTicket(Long ticketId, String username, boolean isAdmin);

    TicketResponse assignTechnician(Long ticketId, AssignTechnicianRequest request);

    TicketResponse updateStatus(Long ticketId, UpdateStatusRequest request, String username, boolean isAdmin, boolean isTechnician);

    TicketResponse addComment(Long ticketId, CommentCreateRequest request, String username, boolean isAdmin, boolean isTechnician);

    TicketResponse addAttachments(Long ticketId, List<MultipartFile> files, String username, boolean isAdmin, boolean isTechnician);
}
