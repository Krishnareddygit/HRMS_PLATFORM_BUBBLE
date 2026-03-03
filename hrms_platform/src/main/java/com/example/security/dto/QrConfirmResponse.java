package com.example.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QrConfirmResponse {
    private boolean success;
    private String message;
    private QrLoginData data;
}
