package com.example.hrms_platform_document.dto;


import lombok.Data;

@Data
public class DocumentUploadRequest {

    private String documentType;
    private String documentName;
    private Boolean isConfidential;

    // getters & setters
}
