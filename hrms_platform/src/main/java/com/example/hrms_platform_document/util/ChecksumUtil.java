//package com.example.hrms_platform_document.util;
//
//import java.security.MessageDigest;
//import java.util.Base64;
//
//public class ChecksumUtil {
//
//    public static String generate(byte[] data) {
//        try {
//            MessageDigest md = MessageDigest.getInstance("SHA-256");
//            byte[] hash = md.digest(data);
//            return Base64.getEncoder().encodeToString(hash);
//        } catch (Exception e) {
//            throw new RuntimeException("Checksum generation failed", e);
//        }
//    }
//}
//
