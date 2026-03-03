
package com.example.EmployeeManagement.Model;

import com.example.EmployeeManagement.audit.entity.AuditableEntity;
import com.example.security.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "employee")
@Getter
@Setter
@EqualsAndHashCode(
        onlyExplicitlyIncluded = true,
        callSuper = false
)
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends AuditableEntity {
    @Id
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "employee_id_generator"
    )
    @SequenceGenerator(
            name = "employee_id_generator",
            sequenceName = "employee_id_seq",
            allocationSize = 1
    )
    @Column(name = "employee_id")
    private Long employeeId;

    private String firstName;
    private String lastName;
    private String companyEmail;
    private LocalDate dateOfJoining;
    private String status;
    private String employeeType;
    private Long phoneNumber;
    private String currentBand;
    private double currentExperience;
    private String designation;
    private int ctc;
    private String department;

    private String subBusinessUnit;
    private String currentOfficeLocation;

//    relation yet to establish
    @Column(name = "created_by_hr_user_id", nullable = false)
    private Long createdByHrUserId;


    @Column(name = "profile_image_key")
    private String profileImageKey;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonIgnore
//    @JsonManagedReference
    @OneToOne(mappedBy = "employee" ,
              cascade = CascadeType.ALL)
    private EmployeePersonal employeePersonal;

    @JsonIgnore
//    @JsonManagedReference
    @OneToOne(mappedBy = "employee" ,
              cascade = CascadeType.ALL)
    private Account account;

    @JsonIgnore
//    @JsonManagedReference
    @OneToOne(mappedBy = "employee" ,
              cascade = CascadeType.ALL)
    private JobDetails jobDetails;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
               cascade = CascadeType.ALL ,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    private Set<EmployeeAddress> employeeAddress;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
               cascade = CascadeType.ALL ,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    private Set<EmployeeEducation> employeeEducations;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
               cascade = CascadeType.ALL ,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    private Set<EmployeeSkill> employeeSkills;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
               cascade = CascadeType.ALL ,
               orphanRemoval = true,
               fetch = FetchType.LAZY)
    private Set<EmployeeBand> employeeBands;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
              cascade = CascadeType.ALL ,
              orphanRemoval = true,
              fetch = FetchType.LAZY)
    private Set<EmployeeManagerHistory> employeeManagerHistories;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
            cascade = CascadeType.ALL ,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private Set<EmploymentContract> employmentContracts;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
            cascade = CascadeType.ALL ,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private Set<EmployeeEmergency> employeeEmergencies;

    @JsonIgnore
//    @JsonManagedReference
    @OneToMany(mappedBy = "employee" ,
            cascade = CascadeType.ALL ,
            orphanRemoval = true,
            fetch = FetchType.LAZY)
    private Set<Experience> employeeExperiences;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    //    current manager of the employee
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private Employee manager;

//    Set of employees who are reporting to this employee
    @JsonIgnore
    @OneToMany(mappedBy = "manager",
               fetch = FetchType.LAZY)
    private Set<Employee> subordinates;

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

