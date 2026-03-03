package com.example.time.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiftDTO {

    private Long shiftId;

    private String shiftName;
    private LocalTime startTime;
    private LocalTime endTime;

    private Integer workingDays;
}
