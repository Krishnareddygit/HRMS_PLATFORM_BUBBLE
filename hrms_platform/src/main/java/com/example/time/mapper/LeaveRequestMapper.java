package com.example.time.mapper;


import com.example.EmployeeManagement.Model.Employee;
import com.example.time.dto.LeaveHistoryResponseDTO;
import com.example.time.dto.LeaveRequestDTO;
import com.example.time.entity.LeaveRequest;

public class LeaveRequestMapper {

    public static LeaveRequest toEntity(LeaveRequestDTO dto, Employee employee) {
        LeaveRequest entity = new LeaveRequest();
        entity.setEmployee(employee);
        entity.setLeaveTypeId(dto.getLeaveTypeId());
        entity.setFromDate(dto.getFromDate());
        entity.setToDate(dto.getToDate());
        entity.setTotalDays(dto.getTotalDays());
        return entity;
    }

    public static LeaveRequestDTO toDTO(LeaveRequest entity) {
        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setLeaveRequestId(entity.getLeaveRequestId());
        if (entity.getEmployee() != null) {
            dto.setEmployeeId(entity.getEmployee().getEmployeeId());
        }
        dto.setLeaveTypeId(entity.getLeaveTypeId());
        dto.setFromDate(entity.getFromDate());
        dto.setToDate(entity.getToDate());
        dto.setTotalDays(entity.getTotalDays());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public static LeaveHistoryResponseDTO toLeaveHistoryDTO(LeaveRequest entity) {
        LeaveHistoryResponseDTO dto = new LeaveHistoryResponseDTO();
//        dto.setLeaveRequestId(entity.getLeaveRequestId());
        if (entity.getEmployee() != null) {
            dto.setEmployeeId(entity.getEmployee().getEmployeeId());
        }
//        dto.setLeaveTypeId(entity.getLeaveTypeId());
        dto.setFromDate(entity.getFromDate());
        dto.setToDate(entity.getToDate());
        dto.setTotalDays(entity.getTotalDays());
        dto.setStatus(entity.getStatus());
        return dto;
    }


}

