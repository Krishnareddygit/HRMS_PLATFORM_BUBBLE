package com.example.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QrLoginData {
    private String token;
    private String username;
    private Long employeeId;
    private Set<String> roles;
}
