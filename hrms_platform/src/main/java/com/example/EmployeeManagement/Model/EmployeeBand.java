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


@Entity
@Table(name = "employee_band")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(
        onlyExplicitlyIncluded = true,
        callSuper = false
)
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "historyId")

public class EmployeeBand extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    // FK → employee.employee_id (Phase-1: keep as plain field)
//    private Long employeeId;

    private String bandLevel;     // L1, L2, L3 etc

    private LocalDate fromDate;
    private LocalDate toDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonIgnore
//    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;
}


