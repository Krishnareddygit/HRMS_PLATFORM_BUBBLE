package com.example.EmployeeManagement.Exception;

public class EmployeePersonalNotFoundException extends RuntimeException{
    public EmployeePersonalNotFoundException(Long id) {
        super("Employee personal details not found for the id: "+id);
    }
}
