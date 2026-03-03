package com.example.EmployeeManagement.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeePersonalDTO {

    private Long personalId;

    private Long employeeId;
    private LocalDate dob;
    private String gender;
    private String bloodGroup;
    private String nationality;
    private String maritalStatus;
    private String fatherName;
    private String spouseName;

    private String personalMail;
    private String alternatePhoneNumber;
}
