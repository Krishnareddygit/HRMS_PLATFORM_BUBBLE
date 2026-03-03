package com.example.time.mapper;

import com.example.time.dto.AttendanceDTO;
import com.example.time.entity.Attendance;

public class AttendanceMapper {
    public static AttendanceDTO toDTO(Attendance attendance){
        AttendanceDTO dto = new AttendanceDTO();
        if (attendance.getEmployee() != null) {
            dto.setEmployeeId(attendance.getEmployee().getEmployeeId());
        }
        dto.setDate(attendance.getDate());
        dto.setCheckIn(attendance.getCheckIn());
        dto.setCheckOut(attendance.getCheckOut());
        dto.setStatus(attendance.getStatus());
        dto.setLatitude(attendance.getLatitude());
        dto.setLongitude(attendance.getLongitude());
        dto.setIpAddress(attendance.getIpAddress());
        dto.setSource(attendance.getSource());
        return dto;
    }

}

