package com.example.EmployeeManagement.Controller;

import com.example.EmployeeManagement.DTO.EmployeeCreateRequestDTO;
import com.example.security.util.CompanyEmailGenerator;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.EmployeeManagement.DTO.EmployeeCreateResponse;
import com.example.EmployeeManagement.DTO.EmployeeDTO;
import com.example.EmployeeManagement.Model.Employee;
import com.example.EmployeeManagement.Service.EmployeeService;
import com.example.security.dto.RegisterRequest;
import com.example.security.model.User;
import com.example.security.repository.UserRepository;
import com.example.security.service.EmailService;
import com.example.security.service.UserService;
import com.example.security.util.PasswordGenerator;
import com.example.notifications.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/hr/employees")
@RequiredArgsConstructor
public class HrEmployeeController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;

    private final  UserService userService;
    private final  PasswordGenerator passwordGenerator;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final CompanyEmailGenerator companyEmailGenerator;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_HR','ROLE_HR_MANAGER','ROLE_HR_OPERATIONS', 'ROLE_HR_PAYROLL', 'ROLE_HR_BP', 'ROLE_TALENT_ACQUISITION','ROLE_ADMIN') or @securityUtil.isHrUser()")
    public ResponseEntity<EmployeeCreateResponse> createEmployee(
            @RequestBody EmployeeCreateRequestDTO request) {

        String hrUsername = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        User hrUser = userRepository.findByUsername(hrUsername)
                .orElseThrow(() -> new RuntimeException("HR not found"));

        //  Generate company email
        String companyEmail = companyEmailGenerator.generate(
                request.getFirstName(),
                request.getLastName()
        );

        //  Generate temp password
        String tempPassword = passwordGenerator.generateTempPassword();

        // Convert to entity
        Employee employee = employeeService.toEntityFromCreateRequest(
                request,
                hrUser.getId(),
                companyEmail
        );

        //  Save employee
        Employee savedEmployee = employeeService.addEmployeeInternal(employee);

        //  Create login
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername(companyEmail);
        registerRequest.setPassword(tempPassword);
        registerRequest.setEmployeeId(savedEmployee.getEmployeeId());

        User createdUser = userService.registerNewUser(registerRequest);

        // Link user to employee
        savedEmployee.setUser(createdUser);
        employeeService.addEmployeeInternal(savedEmployee);

        // Send onboarding email
        if (request.getPersonalEmail() != null && !request.getPersonalEmail().isBlank()) {
            emailService.sendEmployeeOnboardingEmail(
                    request.getPersonalEmail().trim(),
                    companyEmail,
                    tempPassword
            );
        }

        return ResponseEntity.ok(
                new EmployeeCreateResponse(
                        savedEmployee.getEmployeeId(),
                        companyEmail,
                        tempPassword
                )
        );
    }

}


