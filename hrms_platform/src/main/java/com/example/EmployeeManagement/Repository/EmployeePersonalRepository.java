package com.example.EmployeeManagement.Repository;


import com.example.EmployeeManagement.Model.EmployeePersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeePersonalRepository extends JpaRepository<EmployeePersonal, Long> {

    @Query("""
        SELECT e
        FROM EmployeePersonal e
        WHERE e.employee.employeeId = :id
   """)
    Optional<EmployeePersonal> getByEmployeeId(@Param("id") Long id);


    @Query("""
        DELETE FROM EmployeePersonal e
        WHERE e.employee.employeeId=:id
    """)
    void deleteByEmployeeId(@Param("id") Long id);
}
