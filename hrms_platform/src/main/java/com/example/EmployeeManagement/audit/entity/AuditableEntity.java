package com.example.EmployeeManagement.audit.entity;


import com.example.EmployeeManagement.audit.listener.AuditEntityListener;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;

@EntityListeners(AuditEntityListener.class)
@MappedSuperclass
public abstract class AuditableEntity {
}

