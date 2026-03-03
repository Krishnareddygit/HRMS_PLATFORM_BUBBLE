package com.example.time.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class LeaveHistoryResponseDTO {

    private long employeeId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private int totalDays;
    private String status;
}
