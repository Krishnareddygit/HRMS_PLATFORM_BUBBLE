package com.example.security.service;

import com.example.EmployeeManagement.DTO.EmployeeCreateRequestDTO;
import com.example.EmployeeManagement.DTO.EmployeeCreateResponse;
import com.example.EmployeeManagement.DTO.EmployeeDTO;
import com.example.EmployeeManagement.Model.Employee;
import com.example.EmployeeManagement.Service.EmployeeService;
import com.example.security.dto.RegisterRequest;
import com.example.security.model.User;
import com.example.security.util.CompanyEmailGenerator;
import com.example.security.util.PasswordGenerator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final UserService userService;
    private final EmployeeService employeeService;
    private final CompanyEmailGenerator companyEmailGenerator;
    private final PasswordGenerator passwordGenerator;
    private final EmailService emailService; // ✅ ADD

//    @Transactional
//    public EmployeeCreateResponse createEmployee(
//            EmployeeCreateRequestDTO dto,
//            User hrUser) {
//
//        String companyEmail = companyEmailGenerator.generate(
//                dto.getFirstName(),
//                dto.getLastName()
//        );
//
//        String tempPassword = passwordGenerator.generateTempPassword();
//
//        RegisterRequest registerRequest = new RegisterRequest();
//        registerRequest.setUsername(companyEmail);
//        registerRequest.setPassword(tempPassword);
//
//        User user = userService.registerNewUser(registerRequest);
//
//        Employee employee = employeeService.toEntity(dto, hrUser.getId());
////        employee.setEmployeeId(user.getEmployeeId());
//        employee.setCompanyEmail(companyEmail);
//        employee.setUser(user);
//        employee.setCreatedAt(LocalDateTime.now());
//
//        employeeService.addEmployeeInternal(employee);
//
//        // ✅ SEND EMAIL
//        emailService.sendCredentials(
//                dto.getPersonalEmail(),
//                companyEmail,
//                tempPassword
//        );
//
//        // ✅ DO NOT RETURN PASSWORD
//        return new EmployeeCreateResponse(
//                user.getEmployeeId(),
//                companyEmail,
//                "Credentials sent to personal email"
//        );
//    }

@Transactional
    public EmployeeCreateResponse createEmployee(
            EmployeeCreateRequestDTO dto,
            User hrUser) {

        // 1️⃣ Generate company email + temp password
        String companyEmail = companyEmailGenerator.generate(
                dto.getFirstName(),
                dto.getLastName()
        );
        String tempPassword = passwordGenerator.generateTempPassword();

        // 2️⃣ Create USER first
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUsername(companyEmail);
        registerRequest.setPassword(tempPassword);

        User user = userService.registerNewUser(registerRequest);

        // 3️⃣ Create EMPLOYEE (❗ DO NOT set employeeId)
        EmployeeDTO employeeDTO = new EmployeeDTO();
        employeeDTO.setFirstName(dto.getFirstName());
        employeeDTO.setLastName(dto.getLastName());
        employeeDTO.setDepartment(dto.getDepartment());
        employeeDTO.setDesignation(dto.getDesignation());
        employeeDTO.setEmployeeType(dto.getEmployeeType());
        employeeDTO.setDateOfJoining(dto.getDateOfJoining());
        employeeDTO.setCurrentBand(dto.getCurrentBand());
        employeeDTO.setCurrentExperience(dto.getCurrentExperience());
        employeeDTO.setCtc(dto.getCtc());
        employeeDTO.setPhoneNumber(dto.getPhoneNumber());
        employeeDTO.setPersonalEmail(dto.getPersonalEmail());

        Employee employee = employeeService.toEntity(employeeDTO, hrUser.getId());
        employee.setCompanyEmail(companyEmail);
        employee.setCreatedAt(LocalDateTime.now());

        // 4️⃣ Save employee → employeeId GENERATED here
        Employee savedEmployee = employeeService.addEmployeeInternal(employee);

        // 5️⃣ Link USER ↔ EMPLOYEE
        user.setEmployeeId(savedEmployee.getEmployeeId());
        savedEmployee.setUser(user);

        // 6️⃣ Persist updated user
        userService.save(user);

        // 7️⃣ Send credentials email
        emailService.sendEmployeeOnboardingEmail(
                dto.getPersonalEmail(),
                companyEmail,
                tempPassword
        );

        // 8️⃣ Return response (NO password exposed)
        return new EmployeeCreateResponse(
                savedEmployee.getEmployeeId(),
                companyEmail,
                "Credentials sent to personal email"
        );
    }
}

