package com.smartcampus.operationshub.ticketing.specification;

import com.smartcampus.operationshub.ticketing.entity.Ticket;
import com.smartcampus.operationshub.ticketing.entity.TicketPriority;
import com.smartcampus.operationshub.ticketing.entity.TicketStatus;
import org.springframework.data.jpa.domain.Specification;

public final class TicketSpecification {

    private TicketSpecification() {
    }

    public static Specification<Ticket> hasStatus(TicketStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Ticket> hasPriority(TicketPriority priority) {
        return (root, query, cb) -> priority == null ? cb.conjunction() : cb.equal(root.get("priority"), priority);
    }
}
