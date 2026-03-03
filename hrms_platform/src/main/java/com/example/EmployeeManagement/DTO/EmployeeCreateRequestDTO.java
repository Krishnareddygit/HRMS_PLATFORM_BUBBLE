package com.example.EmployeeManagement.DTO;

import lombok.Data;
import java.time.LocalDate;

@Data
public class EmployeeCreateRequestDTO {

    // Identity
    private String firstName;
    private String lastName;

    // Organization
    private String department;
    private String designation;
    private String employeeType;   // FULL_TIME / INTERN / CONTRACT

    // HR related
    private LocalDate dateOfJoining;
    private String currentBand;
    private Double currentExperience;
    private Integer ctc;

    // Contact (optional but realistic)
    private Long phoneNumber;
    private String personalEmail;

    private String subBusinessUnit;
    private String currentOfficeLocation;
    private Long managerId;

}
