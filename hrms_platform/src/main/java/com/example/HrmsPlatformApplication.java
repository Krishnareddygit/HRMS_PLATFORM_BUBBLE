package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Unified HRMS application entry point.
// All modules live under the base package: com.example.hrms_platform
@SpringBootApplication
public class HrmsPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(HrmsPlatformApplication.class, args);
	}

}

