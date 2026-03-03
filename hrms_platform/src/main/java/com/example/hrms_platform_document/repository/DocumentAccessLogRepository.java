package com.example.hrms_platform_document.repository;


import com.example.hrms_platform_document.entity.DocumentAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentAccessLogRepository extends JpaRepository<DocumentAccessLog, Long> {

    void deleteByEmployeeEmployeeId(Long employeeId);

    void deleteByDocumentDocumentId(Long documentId);
}

