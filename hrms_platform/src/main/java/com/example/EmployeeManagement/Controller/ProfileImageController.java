package com.example.EmployeeManagement.Controller;

import com.example.EmployeeManagement.Service.ProfileImageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile-images")
public class ProfileImageController {

    private final ProfileImageService profileImageService;

    public ProfileImageController(ProfileImageService profileImageService) {
        this.profileImageService = profileImageService;
    }

    // Upload / Replace profile image
    @PostMapping("/{employeeId}")
    public ResponseEntity<String> uploadProfileImage(
            @PathVariable Long employeeId,
            @RequestParam("file") MultipartFile file) {

        profileImageService.uploadProfileImage(employeeId, file);
        return ResponseEntity.ok("Profile image uploaded successfully");
    }

    // Get profile image (returns presigned URL)
    @GetMapping("/{employeeId}")
    public ResponseEntity<String> getProfileImage(
            @PathVariable Long employeeId) {

        String url = profileImageService.getProfileImageUrl(employeeId);
        return ResponseEntity.ok(url);
    }

    // Delete profile image
    @DeleteMapping("/{employeeId}")
    public ResponseEntity<String> deleteProfileImage(
            @PathVariable Long employeeId) {

        profileImageService.deleteProfileImage(employeeId);
        return ResponseEntity.ok("Profile image deleted successfully");
    }
}