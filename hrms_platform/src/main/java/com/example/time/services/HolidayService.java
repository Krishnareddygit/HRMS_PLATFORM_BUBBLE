package com.example.time.services;


import com.example.time.entity.Holiday;
import java.util.List;

public interface HolidayService {

    Holiday createHoliday(Holiday holiday);

    List<com.example.time.entity.Holiday> getHolidaysByLocation(String location);
}
