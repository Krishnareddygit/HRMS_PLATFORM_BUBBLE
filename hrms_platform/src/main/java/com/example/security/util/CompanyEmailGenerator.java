package com.example.security.util;


import com.example.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CompanyEmailGenerator {

    private final UserRepository userRepository;

    private static final String COMPANY_DOMAIN = "@bounteous.com";

    public String generate(String firstName, String lastName) {

        String baseEmail = normalize(firstName) + "." + normalize(lastName);

        String email = baseEmail + COMPANY_DOMAIN;

        // If email does not exist → return
        if (!userRepository.existsByUsername(email)) {
            return email;
        }

        // If exists → append number
        int suffix = 1;
        while (true) {
            email = baseEmail + suffix + COMPANY_DOMAIN;
            if (!userRepository.existsByUsername(email)) {
                return email;
            }
            suffix++;
        }
    }

    private String normalize(String value) {
        return value
                .trim()
                .toLowerCase()
                .replaceAll("\\s+", "");
    }
}

