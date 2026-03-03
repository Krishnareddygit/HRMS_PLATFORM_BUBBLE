package com.example.EmployeeManagement.Controller;

import com.example.EmployeeManagement.Repository.EmployeeRepository;
import com.example.hrms_platform_document.enums.DocumentStatus;
import com.example.hrms_platform_document.repository.DocumentRepository;
import com.example.time.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
public class HRDashboardController {

    private final EmployeeRepository employeeRepository;
    private final DocumentRepository documentRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    @PreAuthorize("hasAnyRole('HR','HR_OPERATIONS','HR_BP','HR_PAYROLL','TALENT_ACQUISITION','ADMIN')")
    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() {
        long totalEmployees = employeeRepository.count();
        long newEmployees = employeeRepository.countByDateOfJoiningAfter(LocalDate.now().minusDays(30));
        long activeEmployees = employeeRepository.countByStatus("ACTIVE");
        if (activeEmployees == 0 && totalEmployees > 0) {
            activeEmployees = totalEmployees;
        }

        long pendingDocs = documentRepository.countByStatus(DocumentStatus.PENDING_VERIFICATION);
        long pendingLeaves = leaveRequestRepository.countByStatus("PENDING");

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("newEmployees", newEmployees);
        stats.put("activeEmployees", activeEmployees);
        stats.put("pendingTasks", pendingDocs + pendingLeaves);
        return stats;
    }
}
