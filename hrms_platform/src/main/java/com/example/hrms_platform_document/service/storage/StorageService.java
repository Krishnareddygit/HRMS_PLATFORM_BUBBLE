package com.example.hrms_platform_document.service.storage;


import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String uploadToStaging(MultipartFile file, String key);

    void moveToVerified(String stagingKey, String verifiedKey);

    void delete(String key);

    String generatePresignedUrl(String key);

    boolean exists(String key);

    String findLatestKey(String prefix);
}

