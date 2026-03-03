package com.example.security.dto;

import lombok.Data;

@Data
public class UpdateHrRequest {
    private Long id;
    private String hrRole;
    private Boolean enabled;
}
