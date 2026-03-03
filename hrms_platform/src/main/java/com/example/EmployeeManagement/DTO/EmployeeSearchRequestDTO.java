package com.example.EmployeeManagement.DTO;

import lombok.Data;

@Data
public class EmployeeSearchRequestDTO {

    private String name;
    private String department;
    private String designation;
    private String companyBaseLocation;
    private String band;
    private Long employeeId;
}

