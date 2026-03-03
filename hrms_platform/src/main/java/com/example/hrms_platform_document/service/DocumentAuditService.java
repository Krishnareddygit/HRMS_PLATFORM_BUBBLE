package com.example.hrms_platform_document.service;

import com.example.EmployeeManagement.Model.Employee;
import com.example.hrms_platform_document.entity.Document;
import com.example.hrms_platform_document.entity.DocumentAudit;
import com.example.hrms_platform_document.entity.DocumentVersion;
import com.example.hrms_platform_document.enums.DocumentAuditAction;
import com.example.hrms_platform_document.repository.DocumentAuditRepository;
import org.springframework.stereotype.Service;

@Service
public class DocumentAuditService {

    private final DocumentAuditRepository auditRepository;

    public DocumentAuditService(DocumentAuditRepository auditRepository) {
        this.auditRepository = auditRepository;
    }

    public void log(
            Document document,
            DocumentVersion version,
            DocumentAuditAction action,
            Employee performedBy,
            String remarks
    ) {
        DocumentAudit audit = new DocumentAudit();
        audit.setDocument(document);
        audit.setVersion(version);
        audit.setAction(action);
        audit.setPerformedBy(performedBy);
        audit.setRemarks(remarks);

        auditRepository.save(audit);
    }

    public void deleteByDocumentId(Long documentId) {
        auditRepository.deleteByDocumentDocumentId(documentId);
        auditRepository.flush();
    }

    public String getLatestRemarks(Long documentId) {
        return auditRepository.findTopByDocumentDocumentIdOrderByPerformedAtDesc(documentId)
                .map(DocumentAudit::getRemarks)
                .orElse(null);
    }

    public String getLatestRemarks(Long documentId, DocumentAuditAction action) {
        return auditRepository.findTopByDocumentDocumentIdAndActionOrderByPerformedAtDesc(documentId, action)
                .map(DocumentAudit::getRemarks)
                .orElse(null);
    }
}


