package com.example.security.service;

import com.example.security.constants.RoleConstants;
import com.example.security.dto.ChangePasswordRequest;
import com.example.security.dto.RegisterRequest;
import com.example.security.dto.ResetPasswordRequest;
import com.example.security.model.Role;
import com.example.security.model.User;
import com.example.EmployeeManagement.Model.Employee;
import com.example.EmployeeManagement.Repository.EmployeeRepository;
import com.example.security.repository.RoleRepository;
import com.example.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final EmployeeRepository employeeRepository;
    private final com.example.security.util.SecurityUtil securityUtil;
    @org.springframework.beans.factory.annotation.Value("${app.frontend.base-url:}")
    private String frontendBaseUrl;


    /**
     * Register a new user.
     * Default role: ROLE_EMPLOYEE
     */
    @Transactional
    public User registerNewUser(RegisterRequest request) {

        if (userRepository.findByUsernameIgnoreCase(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username is already taken");
        }

        Role employeeRole = roleRepository
                .findByName(RoleConstants.ROLE_EMPLOYEE)
                .orElseThrow(() -> new RuntimeException("ROLE_EMPLOYEE not found"));

        Set<Role> roles = new HashSet<>();
        roles.add(employeeRole);

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .employeeId(request.getEmployeeId())
                .enabled(true)
                .roles(roles)
                .mustChangePassword(true)   // 🔐 FORCE FIRST LOGIN CHANGE
                .build();

        return userRepository.save(user);
    }


    //change password for logged-in users
    @Transactional
    public void changePassword(String username, ChangePasswordRequest request) {

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false); // ✅ unlock account
        userRepository.save(user);
    }


    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setMustChangePassword(false);

        userRepository.save(user);
    }

    @Transactional
    public void generateResetToken(String username) {

        User user = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        String baseUrl = frontendBaseUrl;
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "http://localhost:5173";
        }
        String resetLink = baseUrl + "/forgot-password?token=" + token;

        emailService.sendPasswordResetEmail(
                user.getUsername(),
                resetLink
        );

        // Fallback for local testing
        System.out.println("Password reset link: " + resetLink);
    }

    @Transactional
    public void deleteByEmployeeId(Long employeeId) {
        userRepository.deleteByEmployeeId(employeeId);
    }

    @Transactional
    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Auto-link user to employee based on company_email or user_id.
     */
    @Transactional
    public User autoLinkEmployee(User user) {
        if (user == null) {
            return null;
        }

        Employee employee = employeeRepository.findByCompanyEmailIgnoreCase(user.getUsername())
                .orElseGet(() -> employeeRepository.findByUserId(user.getId()).orElse(null));

        if (employee == null && shouldAutoCreateEmployee(user)) {
            Employee created = new Employee();
            String username = user.getUsername() == null ? "" : user.getUsername();
            String[] names = splitNameFromUsername(username);
            created.setFirstName(names[0]);
            created.setLastName(names[1]);
            created.setCompanyEmail(username);
            created.setStatus("ACTIVE");
            created.setEmployeeType("FULL_TIME");
            created.setCurrentBand("B1");
            created.setCurrentExperience(0);
            created.setCtc(0);
            created.setDepartment(isHrRole(user) ? "HR" : "General");
            created.setDesignation(isHrRole(user) ? "HR" : "Employee");
            created.setDateOfJoining(LocalDate.now());
            created.setCreatedByHrUserId(user.getId());
            created.setCreatedAt(LocalDateTime.now());
            created.setUpdatedAt(LocalDateTime.now());
            created.setUser(user);
            assignHrManagerIfNeeded(created, user);
            employee = employeeRepository.save(created);
        }

        if (employee == null) {
            return user;
        }

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
            return userRepository.save(user);
        }

        return user;
    }

    private void assignHrManagerIfNeeded(Employee employee, User user) {
        if (employee == null || user == null) {
            return;
        }
        if (!isHrRole(user)) {
            return;
        }
        if (isHrManagerRole(user)) {
            return;
        }
        if (employee.getManager() != null) {
            return;
        }
        securityUtil.findHrManagerForDepartment(employee.getDepartment())
                .ifPresent(employee::setManager);
    }

    private boolean shouldAutoCreateEmployee(User user) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(role -> {
            String name = role.getName();
            return RoleConstants.ROLE_EMPLOYEE.equals(name)
                    || RoleConstants.ROLE_HR_OPERATIONS.equals(name)
                    || RoleConstants.ROLE_HR_BP.equals(name)
                    || RoleConstants.ROLE_HR_PAYROLL.equals(name)
                    || RoleConstants.ROLE_TALENT_ACQUISITION.equals(name)
                    || RoleConstants.ROLE_HR_MANAGER.equals(name);
        });
    }

    private boolean isHrRole(User user) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(role -> {
            String name = role.getName();
            return RoleConstants.ROLE_HR_OPERATIONS.equals(name)
                    || RoleConstants.ROLE_HR_BP.equals(name)
                    || RoleConstants.ROLE_HR_PAYROLL.equals(name)
                    || RoleConstants.ROLE_TALENT_ACQUISITION.equals(name)
                    || RoleConstants.ROLE_HR_MANAGER.equals(name);
        });
    }

    private boolean isHrManagerRole(User user) {
        return user.getRoles() != null && user.getRoles().stream().anyMatch(role -> {
            String name = role.getName();
            return RoleConstants.ROLE_HR_MANAGER.equals(name);
        });
    }

    private String[] splitNameFromUsername(String username) {
        String local = username == null ? "" : username;
        int at = local.indexOf('@');
        if (at > 0) {
            local = local.substring(0, at);
        }
        String[] parts = local.split("[._-]+");
        String first = parts.length > 0 && !parts[0].isBlank() ? capitalize(parts[0]) : "Employee";
        String last = parts.length > 1 && !parts[1].isBlank() ? capitalize(parts[1]) : "";
        return new String[]{first, last};
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() == 1) {
            return trimmed.toUpperCase();
        }
        return trimmed.substring(0, 1).toUpperCase() + trimmed.substring(1).toLowerCase();
    }

}

