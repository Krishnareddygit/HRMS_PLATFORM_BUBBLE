package com.example.time.services.Implementation;

import com.example.EmployeeManagement.Model.Employee;
import com.example.time.entity.LeaveBalance;
import com.example.time.entity.LeaveRequest;
import com.example.time.exception.BadRequestException;
import com.example.time.repository.LeaveBalanceRepository;
import com.example.time.repository.LeaveRequestRepository;
import com.example.time.services.LeaveService;
import com.example.security.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveServiceImplementation implements LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private SecurityUtil securityUtil;

    @Override
    public LeaveRequest applyLeave(LeaveRequest request) {
        if (request.getTotalDays() == null || request.getTotalDays() <= 0) {
            throw new BadRequestException("Total days must be greater than 0.");
        }
        LeaveBalance leaveBalance = leaveBalanceRepository
                .findByEmployeeAndLeaveTypeId(request.getEmployee(), request.getLeaveTypeId())
                .orElse(null);
        if (leaveBalance != null && leaveBalance.getRemainingLeaves() != null) {
            if (request.getTotalDays() > leaveBalance.getRemainingLeaves()) {
                throw new BadRequestException("Requested days exceed remaining leave balance.");
            }
        }
        request.setStatus("PENDING");
        request.setAppliedOn(LocalDateTime.now());
        return leaveRequestRepository.save(request);
    }

    @Override
    public LeaveRequest approveLeave(Long leaveRequestId, Long approverId) {

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        // 🔐 MANAGER CHECK (CRITICAL)
        Employee currentManager = leaveRequest.getEmployee().getManager();

        if (currentManager == null ||
                !currentManager.getEmployeeId().equals(approverId)) {
            throw new RuntimeException("Only current manager can approve leave");
        }

        // 🔐 STATUS CHECK
        if (!"PENDING".equals(leaveRequest.getStatus())) {
            throw new RuntimeException("Leave is not in PENDING state");
        }

        LeaveBalance leaveBalance = leaveBalanceRepository
                .findByEmployeeAndLeaveTypeId(
                        leaveRequest.getEmployee(),
                        leaveRequest.getLeaveTypeId()
                )
                .orElseThrow(() -> new RuntimeException("Leave balance missing"));

        leaveBalance.setUsedLeaves(
                leaveBalance.getUsedLeaves() + leaveRequest.getTotalDays());

        leaveBalance.setRemainingLeaves(
                leaveBalance.getTotalLeaves() - leaveBalance.getUsedLeaves());

        leaveRequest.setStatus("APPROVED");
        leaveRequest.setApprovedBy(approverId);
        leaveRequest.setApprovedOn(LocalDateTime.now());

        leaveBalanceRepository.save(leaveBalance);
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public LeaveRequest approveLeaveAsHr(Long leaveRequestId, Long approverId) {

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        enforceHrManagerForHrEmployee(leaveRequest);
        enforceHrManagerOnlyForHrTeam(leaveRequest);

        if (!"PENDING".equals(leaveRequest.getStatus())) {
            throw new RuntimeException("Leave is not in PENDING state");
        }

        LeaveBalance leaveBalance = leaveBalanceRepository
                .findByEmployeeAndLeaveTypeId(
                        leaveRequest.getEmployee(),
                        leaveRequest.getLeaveTypeId()
                )
                .orElseThrow(() -> new RuntimeException("Leave balance missing"));

        leaveBalance.setUsedLeaves(
                leaveBalance.getUsedLeaves() + leaveRequest.getTotalDays());

        leaveBalance.setRemainingLeaves(
                leaveBalance.getTotalLeaves() - leaveBalance.getUsedLeaves());

        leaveRequest.setStatus("APPROVED");
        leaveRequest.setApprovedBy(approverId);
        leaveRequest.setApprovedOn(LocalDateTime.now());

        leaveBalanceRepository.save(leaveBalance);
        return leaveRequestRepository.save(leaveRequest);
    }


    @Override
    public LeaveRequest rejectLeave(Long leaveRequestId, Long approverId) {

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        Employee currentManager = leaveRequest.getEmployee().getManager();

        if (currentManager == null ||
                !currentManager.getEmployeeId().equals(approverId)) {
            throw new RuntimeException("Only current manager can reject leave");
        }

        if (!"PENDING".equals(leaveRequest.getStatus())) {
            throw new RuntimeException("Leave is not in PENDING state");
        }

        leaveRequest.setStatus("REJECTED");
        leaveRequest.setApprovedBy(approverId);
        leaveRequest.setApprovedOn(LocalDateTime.now());

        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public LeaveRequest rejectLeaveAsHr(Long leaveRequestId, Long approverId) {

        LeaveRequest leaveRequest = leaveRequestRepository.findById(leaveRequestId)
                .orElseThrow(() -> new RuntimeException("Leave not found"));

        enforceHrManagerForHrEmployee(leaveRequest);
        enforceHrManagerOnlyForHrTeam(leaveRequest);

        if (!"PENDING".equals(leaveRequest.getStatus())) {
            throw new RuntimeException("Leave is not in PENDING state");
        }

        leaveRequest.setStatus("REJECTED");
        leaveRequest.setApprovedBy(approverId);
        leaveRequest.setApprovedOn(LocalDateTime.now());

        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public List<LeaveRequest> getPendingForManager(Long managerId) {
        return leaveRequestRepository.findByEmployee_Manager_EmployeeIdAndStatus(managerId, "PENDING");
    }

    @Override
    public List<LeaveRequest> getPendingAll() {
        return leaveRequestRepository.findByStatus("PENDING");
    }

    @Override
    public List<LeaveRequest> getPendingHrByDepartment(String department) {
        return leaveRequestRepository.findByStatus("PENDING")
                .stream()
                .filter(req -> securityUtil.isHrEmployee(req.getEmployee()))
                .filter(req -> sameDepartment(req.getEmployee(), department))
                .toList();
    }

    @Override
    public List<LeaveRequest> getPendingNonHr() {
        return leaveRequestRepository.findByStatus("PENDING")
                .stream()
                .filter(req -> !securityUtil.isHrEmployee(req.getEmployee()))
                .toList();
    }

    private void enforceHrManagerForHrEmployee(LeaveRequest leaveRequest) {
        if (!securityUtil.isHrEmployee(leaveRequest.getEmployee())) {
            return;
        }
        if (securityUtil.hasRole("ADMIN")) {
            return;
        }
        if (!securityUtil.hasRole("HR_MANAGER")) {
            throw new RuntimeException("Only HR Manager can approve/reject HR team leaves");
        }
        Employee approver = securityUtil.getLoggedInEmployeeOptional()
                .orElseThrow(() -> new RuntimeException("HR Manager employee record not found"));
        String approverDept = approver.getDepartment();
        String employeeDept = leaveRequest.getEmployee().getDepartment();
        if (!sameDepartment(employeeDept, approverDept)) {
            throw new RuntimeException("HR Manager must be in same department");
        }
    }

    private void enforceHrManagerOnlyForHrTeam(LeaveRequest leaveRequest) {
        if (securityUtil.hasRole("ADMIN")) {
            return;
        }
        if (securityUtil.hasRole("HR_MANAGER") && !securityUtil.isHrEmployee(leaveRequest.getEmployee())) {
            throw new RuntimeException("HR Manager can approve only HR team leaves");
        }
    }

    private boolean sameDepartment(Employee employee, String department) {
        if (employee == null) return false;
        return sameDepartment(employee.getDepartment(), department);
    }

    private boolean sameDepartment(String deptA, String deptB) {
        if (deptA == null || deptB == null) {
            return false;
        }
        return deptA.trim().equalsIgnoreCase(deptB.trim());
    }

    @Override
    public List<LeaveRequest> getLeaveHistoryForEmployee(Long employeeId) {
        return leaveRequestRepository
                .findLeaveHistoryByEmployeeId(employeeId);
    }
}

