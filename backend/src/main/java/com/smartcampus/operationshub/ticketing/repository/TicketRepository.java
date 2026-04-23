package com.smartcampus.operationshub.ticketing.repository;

import com.smartcampus.operationshub.ticketing.entity.Ticket;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByCreatedByOrderByCreatedAtDesc(String createdBy);

    List<Ticket> findByAssignedToOrderByCreatedAtDesc(String assignedTo);
}
