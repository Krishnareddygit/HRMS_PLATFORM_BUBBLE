package com.example.EmployeeManagement.Model;

import com.example.EmployeeManagement.audit.entity.AuditableEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "employee_skill")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter

@EqualsAndHashCode(
        onlyExplicitlyIncluded = true,
        callSuper = false
)
//@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "employeeSkillId")

public class EmployeeSkill extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeSkillId;

    // FK → employee.employee_id (Phase-1: keep flat)
//    private Long employeeId;

    private String skillName;        // Java, Spring Boot, React
    private String skillType;        // Technical, Soft, Tool, Domain
    private String proficiencyLevel; // Beginner, Intermediate, Expert

    private Integer yearsOfExperience;
    private Integer lastUsedYear;
    private Boolean isPrimary;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonIgnore
//    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;
}


