package com.example.time.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRequestDTO {

    private Long leaveRequestId;
    private long employeeId;
    private long leaveTypeId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private int totalDays;
    private String status;

}

