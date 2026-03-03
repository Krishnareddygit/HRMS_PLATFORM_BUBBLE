package com.example.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class SupabaseProperties {

    @Value("${supabase.url:}")
    private String urlFromProps;

    @Value("${supabase.service-role-key}")
    private String serviceRoleKey;

    public String getUrl() {
        String url = (urlFromProps != null && !urlFromProps.isBlank())
                ? urlFromProps
                : System.getenv("SUPABASE_URL");
        if (url == null || url.isBlank()) {
            throw new IllegalStateException(
                    "supabase.url or SUPABASE_URL environment variable must be set"
            );
        }
        return url;
    }

    public String getServiceRoleKey() {
        return serviceRoleKey;
    }

    @PostConstruct
    public void debug() {
        System.out.println("Supabase URL = " + getUrl());
        System.out.println("Supabase Service Role Key loaded = "
                + (serviceRoleKey != null));
    }
}

