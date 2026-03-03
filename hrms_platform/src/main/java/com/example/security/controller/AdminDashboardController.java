package com.example.security.controller;

import com.example.EmployeeManagement.Repository.EmployeeRepository;
import com.example.security.model.User;
import com.example.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() {
        long totalEmployees = employeeRepository.count();
        long newEmployees = employeeRepository.countByDateOfJoiningAfter(LocalDate.now().minusDays(30));
        var hrList = userRepository.findAllWithHrRole();
        long totalHRs = hrList.size();
        long activeHRs = hrList.stream().filter(User::isEnabled).count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("totalHRs", totalHRs);
        stats.put("activeHRs", activeHRs);
        stats.put("recentActivity", newEmployees);
        return stats;
    }
}
