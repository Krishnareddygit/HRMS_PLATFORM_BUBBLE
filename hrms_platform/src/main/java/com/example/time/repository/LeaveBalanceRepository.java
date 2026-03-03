package com.example.time.repository;

import com.example.EmployeeManagement.Model.Employee;
import com.example.time.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    Optional<LeaveBalance> findByEmployeeAndLeaveTypeId(Employee employee, Long leaveTypeId);

    List<LeaveBalance> findByEmployee(Employee employee);

    void deleteByEmployeeEmployeeId(Long employeeId);

}

