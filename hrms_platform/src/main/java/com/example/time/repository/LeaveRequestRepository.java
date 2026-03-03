package com.example.time.repository;

import com.example.time.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee_Manager_EmployeeIdAndStatus(Long managerId, String status);

    long countByStatus(String status);

    List<LeaveRequest> findByStatus(String status);

    void deleteByEmployeeEmployeeId(Long employeeId);

    @Query("""
        SELECT lr
        FROM LeaveRequest lr
        WHERE lr.employee.employeeId = :employeeId
          AND lr.status IN ('APPROVED','REJECTED')
        ORDER BY lr.appliedOn DESC
    """)
    List<LeaveRequest> findLeaveHistoryByEmployeeId(@Param("employeeId") Long employeeId);
}

