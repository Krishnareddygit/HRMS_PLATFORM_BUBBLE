package com.example.time.services;


import java.util.List;

public interface AttendanceService {
    com.example.time.entity.Attendance checkIn(long employeeId, String source, Double latitude, Double longitude, String ipAddress);
    com.example.time.entity.Attendance checkOut(long employeeId, String source, Double latitude, Double longitude, String ipAddress);

    List<com.example.time.entity.Attendance> getEmployeeAttendance(long employeeId);

}

