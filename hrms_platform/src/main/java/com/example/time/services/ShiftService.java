package com.example.time.services;

import com.example.time.entity.Shift;

import java.util.List;

public interface ShiftService {
    Shift createShift(Shift shift);
    List<Shift> getAllShifts();
}
