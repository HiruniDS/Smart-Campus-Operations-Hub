package com.smartcampus.operationshub.ticketing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentCreateRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 500, message = "Comment cannot exceed 500 characters")
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
