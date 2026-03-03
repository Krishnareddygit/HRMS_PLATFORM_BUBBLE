package com.example.EmployeeManagement.DTO;

import lombok.Data;

@Data
public class EmployeeSearchDTO {

    private String firstName;
    private String lastName;
    private String companyEmail;
    private String designation;
    private String department;
    private String companyBaseLocation;
    private String band;
    private Long employeeId;
    private String managerName;
    private String profileImageUrl;
    private EmployeeDTO manager;
}
