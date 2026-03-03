package com.example.security.dto;

import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HrListResponse {
    private Long id;
    private String username;
    private boolean enabled;
    private Set<String> roles;
}
