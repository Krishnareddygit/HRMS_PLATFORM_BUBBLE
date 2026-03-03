package com.example.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8081")
                                .description("Local Development Server")
                ))
                .info(new Info()
                        .title("HRMS Platform API")
                        .version("1.0.0")
                        .description("Human Resource Management System - REST API Documentation\n\n" +
                                "This API provides endpoints for managing employee information, " +
                                "including employee profiles, personal details, job information, " +
                                "and time management.")
                        .contact(new Contact()
                                .name("HRMS Support Team")
                                .url("http://localhost:8081")
                                .email("support@hrms.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")));
    }
}
