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
public class HolidayDTO {

    private long holidayId;
    private LocalDate holidayDate;
    private String occasion;
    private String location;
    private boolean optional;

}
