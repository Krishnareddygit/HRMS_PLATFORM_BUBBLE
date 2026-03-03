package com.example.time.services;

import com.example.time.entity.LeaveRequest;
import java.util.List;

public interface LeaveService {
    LeaveRequest applyLeave(LeaveRequest request);
    LeaveRequest approveLeave(Long leaveRequestId, Long approverId);
    LeaveRequest rejectLeave(Long leaveRequestId, Long approverId);
    LeaveRequest approveLeaveAsHr(Long leaveRequestId, Long approverId);
    LeaveRequest rejectLeaveAsHr(Long leaveRequestId, Long approverId);
    List<LeaveRequest> getPendingForManager(Long managerId);
    List<LeaveRequest> getPendingAll();
    List<LeaveRequest> getPendingHrByDepartment(String department);
    List<LeaveRequest> getPendingNonHr();
    List<LeaveRequest> getLeaveHistoryForEmployee(Long employeeId);
}

