package com.example.hrms_platform_document.repository;



import com.example.hrms_platform_document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    Optional<DocumentVersion> findTopByDocumentDocumentIdOrderByVersionNumberDesc(Long documentId);

    void deleteByDocumentDocumentId(Long documentId);

    void deleteByUploadedByEmployeeId(Long employeeId);
}

