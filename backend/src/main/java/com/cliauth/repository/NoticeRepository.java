package com.cliauth.repository;

import com.cliauth.model.Notice;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NoticeRepository extends MongoRepository<Notice, String> {
    List<Notice> findAllByOrderByCreatedAtDesc();
}
