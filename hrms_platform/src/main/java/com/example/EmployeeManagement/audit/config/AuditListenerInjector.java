package com.example.EmployeeManagement.audit.config;

import com.example.EmployeeManagement.Repository.AuditLogRepository;
import com.example.EmployeeManagement.audit.listener.AuditEntityListener;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuditListenerInjector {

    private final AuditLogRepository auditLogRepository;

    @PostConstruct
    public void inject() {
        AuditEntityListener.setAuditLogRepository(auditLogRepository);
    }
}

