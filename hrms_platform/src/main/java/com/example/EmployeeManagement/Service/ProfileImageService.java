package com.example.EmployeeManagement.Service;


import com.example.EmployeeManagement.Model.Employee;
import com.example.EmployeeManagement.Repository.EmployeeRepository;
import com.example.hrms_platform_document.service.storage.StorageService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@Service
public class ProfileImageService {

    private final EmployeeRepository employeeRepository;
    private final StorageService storageService;

    public ProfileImageService(EmployeeRepository employeeRepository,
                                   StorageService storageService) {
        this.employeeRepository = employeeRepository;
        this.storageService = storageService;
    }

    @Transactional
    public void uploadProfileImage(Long employeeId, MultipartFile file) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (!("image/jpeg".equals(contentType) ||
                "image/png".equals(contentType))) {
            throw new RuntimeException("Only JPG and PNG allowed");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new RuntimeException("File size must be less than 2MB");
        }

        //  Delete old image if exists
        if (employee.getProfileImageKey() != null) {
            storageService.delete(employee.getProfileImageKey());
        }

        // Generate S3 key
        String extension = contentType.equals("image/png") ? "png" : "jpg";

        String key = "employees/"
                + employeeId
                + "/profile/"
                + System.currentTimeMillis()
                + "."
                + extension;

        // Upload to S3
        storageService.uploadToStaging(file, key);

        //  Save key in DB
        employee.setProfileImageKey(key);
        employeeRepository.save(employee);
    }

    public String getProfileImageUrl(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getProfileImageKey() == null) {
            return null;
        }

        return storageService.generatePresignedUrl(
                employee.getProfileImageKey()
        );
    }

    @Transactional
    public void deleteProfileImage(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (employee.getProfileImageKey() != null) {
            storageService.delete(employee.getProfileImageKey());
            employee.setProfileImageKey(null);
            employeeRepository.save(employee);
        }
    }
}
