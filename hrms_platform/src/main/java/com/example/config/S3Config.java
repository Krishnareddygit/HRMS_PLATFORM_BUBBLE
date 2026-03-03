package com.example.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;
import software.amazon.awssdk.auth.credentials.EnvironmentVariableCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class S3Config {
    private static final Logger logger = LoggerFactory.getLogger(S3Config.class);

    @Value("${aws.region:ap-south-1}")
    private String awsRegion;

    @Value("${aws.s3.endpoint:}")
    private String awsS3Endpoint;

    @PostConstruct
    public void logResolvedConfig() {
        // Use stdout so this prints regardless of logger level.
        System.out.println(
                "S3 resolved config -> region=" + awsRegion + ", endpoint=" + (awsS3Endpoint == null ? "" : awsS3Endpoint)
        );
    }

    @Bean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create());

        if (awsS3Endpoint != null && !awsS3Endpoint.isBlank()) {
            builder.endpointOverride(URI.create(awsS3Endpoint.trim()));
        }

        logger.info("S3Client config: region={}, endpoint={}", awsRegion, awsS3Endpoint);

        return builder.build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(awsRegion))
                .credentialsProvider(EnvironmentVariableCredentialsProvider.create());

        if (awsS3Endpoint != null && !awsS3Endpoint.isBlank()) {
            builder.endpointOverride(URI.create(awsS3Endpoint.trim()));
        }

        logger.info("S3Presigner config: region={}, endpoint={}", awsRegion, awsS3Endpoint);

        return builder.build();
    }
}


