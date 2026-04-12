package com.smartcampus.operationshub.ticketing.repository;

import com.smartcampus.operationshub.ticketing.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
}
