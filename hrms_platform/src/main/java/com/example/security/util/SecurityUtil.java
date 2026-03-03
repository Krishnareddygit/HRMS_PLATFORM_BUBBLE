package com.example.security.util;

import com.example.EmployeeManagement.Model.Employee;
import com.example.EmployeeManagement.Repository.EmployeeRepository;
import com.example.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("securityUtil")
@RequiredArgsConstructor
public class SecurityUtil {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    public boolean isSelf(Long employeeId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName(); // email / username from JWT

        if (employeeId == null) {
            return false;
        }

        return employeeRepository.findById(employeeId)
                .map(emp -> {
                    if (emp.getCompanyEmail() != null &&
                            emp.getCompanyEmail().equalsIgnoreCase(username)) {
                        return true;
                    }
                    if (emp.getUser() != null && emp.getUser().getUsername() != null &&
                            emp.getUser().getUsername().equalsIgnoreCase(username)) {
                        return true;
                    }
                    return userRepository.findByUsernameIgnoreCase(username)
                            .map(user -> emp.getUser() != null && emp.getUser().getId().equals(user.getId()))
                            .orElse(false);
                })
                .orElse(false);
    }

    public Employee getLoggedInEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        return getLoggedInEmployeeOptional()
                .orElseThrow(() -> new RuntimeException("Logged-in employee not found"));
    }

    public Optional<Employee> getLoggedInEmployeeOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        Optional<Employee> byEmail = employeeRepository.findByCompanyEmailIgnoreCase(username);
        if (byEmail.isPresent()) {
            Employee employee = byEmail.get();
            userRepository.findByUsernameIgnoreCase(username).ifPresent(user -> {
                boolean updated = false;
                if (user.getEmployeeId() == null || !user.getEmployeeId().equals(employee.getEmployeeId())) {
                    user.setEmployeeId(employee.getEmployeeId());
                    updated = true;
                }
                if (employee.getUser() == null || !employee.getUser().getId().equals(user.getId())) {
                    employee.setUser(user);
                    employeeRepository.save(employee);
                }
                if (updated) {
                    userRepository.save(user);
                }
            });
            return byEmail;
        }

        return userRepository.findByUsernameIgnoreCase(username)
                .flatMap(user -> {
                    if (user.getEmployeeId() != null) {
                        return employeeRepository.findById(user.getEmployeeId());
                    }
                    Optional<Employee> byUserId = employeeRepository.findByUserId(user.getId());
                    if (byUserId.isPresent() && user.getEmployeeId() == null) {
                        user.setEmployeeId(byUserId.get().getEmployeeId());
                        userRepository.save(user);
                    }
                    return byUserId;
                });
    }

    public Long getLoggedInUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepository.findByUsernameIgnoreCase(username)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
    }

    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        return auth.getName();
    }

    public static String getCurrentUsernameStatic() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("No authenticated user found");
        }
        return auth.getName();
    }

    public Long getApproverIdFallbackToUser() {
        return getLoggedInEmployeeOptional()
                .map(Employee::getEmployeeId)
                .orElseGet(this::getLoggedInUserId);
    }

    public boolean isHrEmployee(Employee employee) {
        if (employee == null) {
            return false;
        }
        String dept = employee.getDepartment();
        if (dept != null) {
            String normalized = dept.trim().toLowerCase();
            if (normalized.startsWith("hr") ||
                    normalized.startsWith("human resource") ||
                    normalized.startsWith("human resources")) {
                return true;
            }
        }
        if (employee.getUser() != null && employee.getUser().getRoles() != null) {
            return employee.getUser().getRoles().stream().anyMatch(role -> {
                String name = role.getName();
                return name != null && (name.startsWith("ROLE_HR") || "ROLE_TALENT_ACQUISITION".equals(name));
            });
        }
        return false;
    }

    public boolean isHrManager(Employee employee) {
        if (employee == null || employee.getUser() == null || employee.getUser().getRoles() == null) {
            return false;
        }
        return employee.getUser().getRoles().stream().anyMatch(role -> {
            String name = role.getName();
            return name != null && "ROLE_HR_MANAGER".equals(name);
        });
    }

    public Optional<Employee> findHrManagerForDepartment(String department) {
        if (department == null || department.isBlank()) {
            return Optional.empty();
        }
        String target = department.trim().toLowerCase();
        return employeeRepository.findAll().stream()
                .filter(this::isHrManager)
                .filter(emp -> emp.getDepartment() != null && emp.getDepartment().trim().toLowerCase().equals(target))
                .findFirst();
    }

    public boolean hasRole(String role) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities() == null) {
            return false;
        }
        return auth.getAuthorities()
                .stream()
                .anyMatch(a -> {
                    String authority = a.getAuthority();
                    return authority != null && (authority.equals("ROLE_" + role) || authority.equals(role));
                });
    }

    public boolean isHrUser() {
        return getLoggedInEmployeeOptional()
                .map(this::isHrEmployee)
                .orElseGet(() ->
                        SecurityContextHolder.getContext()
                                .getAuthentication()
                                .getAuthorities()
                                .stream()
                                .anyMatch(a -> {
                                    String name = a.getAuthority();
                                    return name != null &&
                                            (name.startsWith("ROLE_HR") ||
                                                    name.startsWith("HR") ||
                                                    "ROLE_TALENT_ACQUISITION".equals(name));
                                })
                );
    }


}

