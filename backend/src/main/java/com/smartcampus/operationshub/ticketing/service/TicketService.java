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
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface TicketService {

    TicketResponse createTicket(TicketCreateRequest request, String username);

    List<TicketResponse> getTickets(TicketStatus status, TicketPriority priority, String username, boolean isAdmin,
            boolean isTechnician);

    TicketResponse getTicketById(String ticketId, String username, boolean isAdmin, boolean isTechnician);

    TicketResponse updateTicket(String ticketId, TicketUpdateRequest request, String username, boolean isAdmin);

    void deleteTicket(String ticketId, String username, boolean isAdmin);

    TicketResponse assignTechnician(String ticketId, AssignTechnicianRequest request);

    TicketResponse updateStatus(String ticketId, UpdateStatusRequest request, String username, boolean isAdmin,
            boolean isTechnician);

    TicketResponse addComment(String ticketId, CommentCreateRequest request, String username, boolean isAdmin,
            boolean isTechnician);

    TicketResponse addAttachments(String ticketId, List<MultipartFile> files, String username, boolean isAdmin,
            boolean isTechnician);

    Resource downloadAttachment(String ticketId, String attachmentId, String username, boolean isAdmin,
            boolean isTechnician);
}
