package com.example.hrms_platform_document.repository;


import com.example.hrms_platform_document.entity.DocumentAudit;
import com.example.hrms_platform_document.enums.DocumentAuditAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentAuditRepository extends JpaRepository<DocumentAudit, Long> {

    List<DocumentAudit> findByDocumentDocumentIdOrderByPerformedAtDesc(Long documentId);

    Optional<DocumentAudit> findTopByDocumentDocumentIdOrderByPerformedAtDesc(Long documentId);

    Optional<DocumentAudit> findTopByDocumentDocumentIdAndActionOrderByPerformedAtDesc(
            Long documentId,
            DocumentAuditAction action
    );

    void deleteByDocumentDocumentId(Long documentId);

    void deleteByPerformedByEmployeeId(Long employeeId);
}

