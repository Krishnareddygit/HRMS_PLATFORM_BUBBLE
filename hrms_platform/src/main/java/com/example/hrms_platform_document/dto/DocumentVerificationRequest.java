package com.example.hrms_platform_document.dto;


import lombok.Data;

@Data
public class DocumentVerificationRequest {

    private String reason; // only for rejection

    // getters & setters
}
