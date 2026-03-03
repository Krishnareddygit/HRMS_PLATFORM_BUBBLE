package com.example.EmployeeManagement.Model;

import com.example.EmployeeManagement.audit.entity.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;


@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "employee_personal")
@Getter
@Setter
@EqualsAndHashCode(
        onlyExplicitlyIncluded = true,
        callSuper = false
)
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "personalId")

public class EmployeePersonal extends AuditableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long personalId;

//    private Long employeeId;     // FK but as plain field
    private LocalDate dob;
    private String gender;
    private String bloodGroup;
    private String nationality;
    private String maritalStatus;
    private String fatherName;
    private String spouseName;

    private String personalMail;
    private String alternatePhoneNumber;

    private Long approvedBy;     // employee_id of the approver


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonIgnore
//    @JsonBackReference
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id" , unique = true)
    private Employee employee;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

