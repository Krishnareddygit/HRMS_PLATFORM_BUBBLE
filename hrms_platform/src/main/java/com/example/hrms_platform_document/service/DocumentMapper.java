package com.example.hrms_platform_document.service;

import com.example.hrms_platform_document.dto.DocumentResponse;
import com.example.hrms_platform_document.entity.Document;

public class DocumentMapper {

    public static DocumentResponse toResponse(Document document) {
        DocumentResponse dto = new DocumentResponse();
        dto.setDocumentId(document.getDocumentId());
        dto.setDocumentType(document.getDocumentType());
        dto.setDocumentName(document.getDocumentName());
        dto.setStatus(document.getStatus());
        dto.setCreatedAt(document.getCreatedAt());
        dto.setUpdatedAt(document.getUpdatedAt());

        if (document.getCurrentVersion() != null) {
            dto.setCurrentVersion(document.getCurrentVersion().getVersionNumber());
        }

        return dto;
    }
}
