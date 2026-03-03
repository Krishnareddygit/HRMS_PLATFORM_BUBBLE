package com.example.hrms_platform_document.entity;

import com.example.EmployeeManagement.Model.Employee;


import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.example.hrms_platform_document.enums.DocumentAccessAction;
import lombok.Data;

@Data
@Entity
@Table(name = "document_access_logs")
public class DocumentAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private DocumentAccessAction action;

    private LocalDateTime accessTime;
    private String ipAddress;

    @PrePersist
    void onCreate() {
        accessTime = LocalDateTime.now();
    }

    // getters and setters
}
