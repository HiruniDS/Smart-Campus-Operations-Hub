package com.smartcampus.operationshub.ticketing.repository;

import com.smartcampus.operationshub.ticketing.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
