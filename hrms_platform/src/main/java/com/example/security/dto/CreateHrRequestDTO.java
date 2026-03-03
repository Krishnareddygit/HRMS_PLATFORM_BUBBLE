package com.example.security.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateHrRequestDTO {

    @NotBlank
    private String role;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    private String department;
    private String designation;
    private String personalEmail;
    private String currentBand;
    private Double currentExperience;
    private Integer ctc;
    private Long phoneNumber;
    private LocalDate dateOfJoining;
}
