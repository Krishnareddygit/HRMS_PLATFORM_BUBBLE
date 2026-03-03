package com.example.hrms_platform_document.repository;


import com.example.hrms_platform_document.entity.Document;
import com.example.hrms_platform_document.enums.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByEmployeeEmployeeId(Long employeeId);

    List<Document> findByStatus(DocumentStatus status);

    long countByStatus(DocumentStatus status);

    List<Document> findByUploadedByEmployeeId(Long employeeId);

    List<Document> findByApprovedByEmployeeId(Long employeeId);

    void deleteByEmployeeEmployeeId(Long employeeId);

    void deleteByUploadedByEmployeeId(Long employeeId);

    @Modifying
    @Query("update Document d set d.approvedBy = null where d.approvedBy.employeeId = :employeeId")
    void clearApprovedByEmployeeId(@Param("employeeId") Long employeeId);
}


