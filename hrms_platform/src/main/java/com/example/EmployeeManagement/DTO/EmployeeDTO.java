package com.example.EmployeeManagement.DTO;


import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDTO {

    private Long employeeId;
    private String firstName;
    private String lastName;
    private String companyEmail;
    private String personalEmail;
    private String designation;
    private String status;
    private String currentBand;
    private String department;
    private String managerName;
    private Long managerId;
    private LocalDate dateOfJoining;
    private String employeeType;
    private Long phoneNumber;
    private double currentExperience;
    private int ctc;

    private String subBusinessUnit;
    private String currentOfficeLocation;
}



