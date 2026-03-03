package com.example.hrms_platform_document.entity;

import com.example.EmployeeManagement.Model.Employee;


import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.example.hrms_platform_document.enums.DocumentAuditAction;
import lombok.Data;

@Data
@Entity
@Table(name = "document_audits")
public class DocumentAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "version_id")
    private DocumentVersion version;

    @Enumerated(EnumType.STRING)
    private DocumentAuditAction action;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private Employee performedBy;

    private LocalDateTime performedAt;
    private String remarks;

    @PrePersist
    void onCreate() {
        performedAt = LocalDateTime.now();
    }

    // getters and setters
}
