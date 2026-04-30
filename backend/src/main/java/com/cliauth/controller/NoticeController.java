package com.cliauth.controller;

import com.cliauth.model.Notice;
import com.cliauth.service.NoticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @PostMapping
    public ResponseEntity<Notice> publishNotice(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String content = payload.get("content");
        String adminId = payload.get("adminId");

        return ResponseEntity.ok(noticeService.publishNotice(title, content, adminId));
    }

    @GetMapping
    public ResponseEntity<List<Notice>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }
}
