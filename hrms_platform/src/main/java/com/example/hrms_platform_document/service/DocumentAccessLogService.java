package com.example.hrms_platform_document.service;

import com.example.hrms_platform_document.entity.Document;
import com.example.hrms_platform_document.entity.DocumentAccessLog;
import com.example.hrms_platform_document.enums.DocumentAccessAction;
import com.example.hrms_platform_document.repository.DocumentAccessLogRepository;
import com.example.security.util.SecurityUtil;
import org.springframework.stereotype.Service;

@Service
public class DocumentAccessLogService {

    private final DocumentAccessLogRepository logRepository;
    private final SecurityUtil securityUtil;

    public DocumentAccessLogService(
            DocumentAccessLogRepository logRepository,
            SecurityUtil securityUtil
    ) {
        this.logRepository = logRepository;
        this.securityUtil = securityUtil;
    }

    public void logAccess(
            Document document,
            DocumentAccessAction action,
            String ipAddress
    ) {
        var employee = securityUtil.getLoggedInEmployee();
        DocumentAccessLog log = new DocumentAccessLog();
        log.setDocument(document);
        log.setEmployee(employee);
        log.setAction(action);
        log.setIpAddress(ipAddress);

        logRepository.save(log);
    }

    public void deleteByDocumentId(Long documentId) {
        logRepository.deleteByDocumentDocumentId(documentId);
        logRepository.flush();
    }
}

