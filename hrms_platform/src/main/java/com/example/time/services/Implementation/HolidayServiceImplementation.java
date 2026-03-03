package com.example.time.services.Implementation;

import com.example.time.entity.Holiday;
import com.example.time.repository.HolidayRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.time.services.*;

import java.util.List;

@Service
public class HolidayServiceImplementation implements HolidayService {

    @Autowired
    private HolidayRepository holidayRepository;
    @Override
    public Holiday createHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    @Override
    public List<Holiday> getHolidaysByLocation(String location) {
        return holidayRepository.findByLocation(location);
    }
}
