package com.example.hrms_platform_document.controller;

import com.example.hrms_platform_document.dto.DocumentResponse;
import com.example.hrms_platform_document.dto.DocumentVerificationRequest;
import com.example.hrms_platform_document.entity.Document;
import com.example.hrms_platform_document.enums.DocumentAuditAction;
import com.example.hrms_platform_document.enums.DocumentAccessAction;
import com.example.hrms_platform_document.enums.DocumentStatus;
import com.example.hrms_platform_document.service.DocumentAccessLogService;
import com.example.hrms_platform_document.service.DocumentAuditService;
import com.example.hrms_platform_document.service.DocumentMapper;
import com.example.hrms_platform_document.service.DocumentService;
import com.example.hrms_platform_document.service.DocumentVerificationService;
import com.example.hrms_platform_document.service.storage.StorageService;
import com.example.security.util.SecurityUtil;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/v1/hrms/documents", "/api/documents"})
public class DocumentController {

    private final DocumentService documentService;
    private final DocumentVerificationService verificationService;
    private final DocumentAccessLogService accessLogService;
    private final DocumentAuditService auditService;
    private final StorageService storageService;
    private final SecurityUtil securityUtil;

    public DocumentController(
            DocumentService documentService,
            DocumentVerificationService verificationService,
            DocumentAccessLogService accessLogService,
            DocumentAuditService auditService,
            StorageService storageService,
            SecurityUtil securityUtil
    ) {
        this.documentService = documentService;
        this.verificationService = verificationService;
        this.accessLogService = accessLogService;
        this.auditService = auditService;
        this.storageService = storageService;
        this.securityUtil = securityUtil;
    }

    private DocumentResponse toResponse(Document document) {
        DocumentResponse dto = DocumentMapper.toResponse(document);
        Long docId = document.getDocumentId();
        String rejectionReason = auditService.getLatestRemarks(docId, DocumentAuditAction.REJECT);
        String approvalReason = auditService.getLatestRemarks(docId, DocumentAuditAction.VERIFY);
        dto.setRejectionReason(rejectionReason);
        dto.setApprovalReason(approvalReason);

        String statusMessage = null;
        if (dto.getStatus() == DocumentStatus.REJECTED) {
            statusMessage = rejectionReason;
        } else if (dto.getStatus() == DocumentStatus.VERIFIED) {
            statusMessage = approvalReason;
        }
        if (statusMessage == null || statusMessage.isBlank()) {
            statusMessage = auditService.getLatestRemarks(docId);
        }
        dto.setStatusMessage(statusMessage);

        return dto;
    }

    // Upload document
    @PostMapping("/upload")
    public DocumentResponse upload(
            @RequestParam MultipartFile file,
            @RequestParam String documentType,
            @RequestParam String documentName
    ) {
        Document doc = documentService.uploadDocument(file, documentType, documentName, false);
        return toResponse(doc);
    }

    // Re-upload document
    @RequestMapping(value = "/{id}/reupload", method = { RequestMethod.POST, RequestMethod.PUT })
    public DocumentResponse reupload(
            @PathVariable Long id,
            @RequestParam MultipartFile file
    ) {
        Document doc = documentService.reuploadDocument(id, file);
        return toResponse(doc);
    }

    // Approve (verify)
    @PutMapping("/{id}/approve")
    public void approve(@PathVariable Long id) {
        verificationService.verifyDocument(id);
    }

    // Verify (alias)
    @PostMapping("/{id}/verify")
    public void verify(@PathVariable Long id) {
        verificationService.verifyDocument(id);
    }

    // Reject
    @RequestMapping(value = "/{id}/reject", method = { RequestMethod.POST, RequestMethod.PUT })
    public void reject(
            @PathVariable Long id,
            @RequestBody(required = false) DocumentVerificationRequest request,
            @RequestParam(required = false) String reason
    ) {
        String finalReason = reason;
        if (request != null && request.getReason() != null && !request.getReason().isBlank()) {
            finalReason = request.getReason();
        }
        verificationService.rejectDocument(id, finalReason == null ? "" : finalReason);
    }

    // Pending documents
    @GetMapping("/pending")
    public List<DocumentResponse> getPending() {
        if (securityUtil.hasRole("ADMIN")) {
            return documentService.getPendingDocuments()
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        if (securityUtil.hasRole("HR_MANAGER")) {
            var employeeOpt = securityUtil.getLoggedInEmployeeOptional();
            if (employeeOpt.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "HR Manager employee record not found");
            }
            var employee = employeeOpt.get();
            return documentService.getPendingDocumentsForHrManager(employee.getDepartment())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        if (securityUtil.isHrUser()) {
            return documentService.getPendingDocumentsNonHr()
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
    }

    // Documents by employee
    @GetMapping("/employee/{employeeId}")
    public List<DocumentResponse> getByEmployee(@PathVariable Long employeeId) {
        boolean canView =
                securityUtil.isSelf(employeeId) ||
                securityUtil.hasRole("ADMIN") ||
                securityUtil.isHrUser();
        if (!canView) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return documentService.getDocumentsByEmployee(employeeId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Download
    @GetMapping("/{id}/download")
    public String download(
            @PathVariable Long id,
            @RequestHeader(value = "X-IP", required = false) String ip
    ) {
        Document doc;
        doc = documentService.getDocumentForDownload(id);

        accessLogService.logAccess(doc, DocumentAccessAction.DOWNLOAD, ip != null ? ip : "UNKNOWN");

        String downloadKey = documentService.resolveDownloadKey(doc);
        return storageService.generatePresignedUrl(downloadKey);
    }

    // Delete document (owner or HR/ADMIN)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        documentService.deleteDocument(id);
    }
}

