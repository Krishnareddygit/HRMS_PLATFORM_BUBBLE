package com.example.hrms_platform_document.dto;

import com.example.hrms_platform_document.enums.DocumentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentResponse {

    private Long documentId;
    private String documentType;
    private String documentName;
    private DocumentStatus status;
    private Integer currentVersion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String rejectionReason;
    private String approvalReason;
    private String statusMessage;

    // getters and setters
}

