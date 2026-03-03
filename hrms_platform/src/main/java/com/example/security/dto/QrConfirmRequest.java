package com.example.security.dto;

import lombok.Data;

@Data
public class QrConfirmRequest {
    private String code;
    private String deviceId;
}
