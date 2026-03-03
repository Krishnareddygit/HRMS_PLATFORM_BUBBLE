package com.example.time.services.Implementation;

import com.example.EmployeeManagement.Model.Employee;
import com.example.EmployeeManagement.Repository.EmployeeRepository;
import com.example.time.entity.Attendance;
import com.example.time.repository.AttendanceRepository;
import com.example.time.services.AttendanceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

@Service
public class AttendanceServiceImplementation implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Value("${attendance.allowed-ips:}")
    private String allowedIpsConfig;

    @Value("${attendance.office-locations:}")
    private String officeLocationsConfig;

    @Value("${attendance.geo-radius-meters:100}")
    private double defaultGeoRadiusMeters;

    @Override
    public Attendance checkIn(long employeeId, String source, Double latitude, Double longitude, String ipAddress) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        Attendance existing = attendanceRepository.findByEmployeeAndDate(employee, LocalDate.now()).orElse(null);
        if (existing != null) {
            if (existing.getCheckOut() == null) {
                throw new RuntimeException("Already checked in for today");
            }
            throw new RuntimeException("Attendance already completed for today");
        }

        String normalizedSource = (source == null || source.isBlank()) ? "WEB" : source.trim().toUpperCase();
        validateSource(normalizedSource, latitude, longitude, ipAddress);

        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(LocalDate.now());
        attendance.setCheckIn(LocalTime.now());
        attendance.setStatus("PRESENT");
        attendance.setSource(normalizedSource);
        attendance.setLatitude(latitude);
        attendance.setLongitude(longitude);
        attendance.setIpAddress(ipAddress);

        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance checkOut(long employeeId, String source, Double latitude, Double longitude, String ipAddress) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));

        Attendance attendance = attendanceRepository
                .findByEmployeeAndDate(employee, LocalDate.now())
                .orElseThrow(() -> new RuntimeException("Check-in not found"));

        if (attendance.getCheckOut() != null) {
            throw new RuntimeException("Already checked out for today");
        }

        String normalizedSource = (source == null || source.isBlank()) ? attendance.getSource() : source.trim().toUpperCase();
        validateSource(normalizedSource, latitude, longitude, ipAddress);

        attendance.setCheckOut(LocalTime.now());
        attendance.setSource(normalizedSource);
        attendance.setLatitude(latitude != null ? latitude : attendance.getLatitude());
        attendance.setLongitude(longitude != null ? longitude : attendance.getLongitude());
        attendance.setIpAddress(ipAddress != null ? ipAddress : attendance.getIpAddress());
        return attendanceRepository.save(attendance);
    }

    @Override
    public List<Attendance> getEmployeeAttendance(long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found: " + employeeId));
        return attendanceRepository.findByEmployee(employee);
    }

    private void validateSource(String source, Double latitude, Double longitude, String ipAddress) {
        if (!"WEB".equals(source)) {
            throw new RuntimeException("Only WEB attendance is supported");
        }
        boolean ipAllowed = isIpAllowed(ipAddress);
        System.out.println("Attendance validate: ip=" + ipAddress + " ipAllowed=" + ipAllowed
                + " allowedIpsConfig=" + allowedIpsConfig);
        if (!ipAllowed) {
            throw new RuntimeException("Check-in allowed only on office network");
        }
    }

    private boolean isIpAllowed(String ipAddress) {
        if (ipAddress == null || ipAddress.isBlank()) {
            return false;
        }
        String candidate = normalizeIp(ipAddress.trim());
        if (allowedIpsConfig == null || allowedIpsConfig.isBlank()) {
            return "::1".equals(candidate) || "127.0.0.1".equals(candidate);
        }
        List<String> allowed = Arrays.stream(allowedIpsConfig.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        for (String rule : allowed) {
            if (ipMatches(candidate, rule)) {
                return true;
            }
        }
        return false;
    }

    private boolean ipMatches(String ip, String rule) {
        String normalizedRule = normalizeIp(rule);
        String normalizedIp = normalizeIp(ip);
        if (normalizedIp.equals(normalizedRule)) {
            return true;
        }
        if (("::1".equals(normalizedIp) || "127.0.0.1".equals(normalizedIp))
                && ("::1".equals(normalizedRule) || "127.0.0.1".equals(normalizedRule))) {
            return true;
        }
        if (normalizedRule.contains("/")) {
            return isInCidr(normalizedIp, normalizedRule);
        }
        if (normalizedRule.contains("-")) {
            return isInRange(normalizedIp, normalizedRule);
        }
        return false;
    }

    private String normalizeIp(String ip) {
        if ("0:0:0:0:0:0:0:1".equals(ip)) {
            return "::1";
        }
        return ip;
    }

    private boolean isInCidr(String ip, String cidr) {
        String[] parts = cidr.split("/");
        if (parts.length != 2) return false;
        String baseIp = parts[0].trim();
        int prefix;
        try {
            prefix = Integer.parseInt(parts[1].trim());
        } catch (NumberFormatException ex) {
            return false;
        }
        if (prefix < 0 || prefix > 32) return false;
        Long ipLong = ipv4ToLong(ip);
        Long baseLong = ipv4ToLong(baseIp);
        if (ipLong == null || baseLong == null) return false;
        long mask = prefix == 0 ? 0 : 0xFFFFFFFFL << (32 - prefix);
        return (ipLong & mask) == (baseLong & mask);
    }

    private boolean isInRange(String ip, String range) {
        String[] parts = range.split("-");
        if (parts.length != 2) return false;
        Long ipLong = ipv4ToLong(ip);
        Long start = ipv4ToLong(parts[0].trim());
        Long end = ipv4ToLong(parts[1].trim());
        if (ipLong == null || start == null || end == null) return false;
        long min = Math.min(start, end);
        long max = Math.max(start, end);
        return ipLong >= min && ipLong <= max;
    }

    private Long ipv4ToLong(String ip) {
        String[] parts = ip.split("\\.");
        if (parts.length != 4) return null;
        long result = 0;
        for (String p : parts) {
            int octet;
            try {
                octet = Integer.parseInt(p.trim());
            } catch (NumberFormatException ex) {
                return null;
            }
            if (octet < 0 || octet > 255) return null;
            result = (result << 8) | octet;
        }
        return result & 0xFFFFFFFFL;
    }

    private boolean isWithinOfficeRadius(double latitude, double longitude) {
        if (officeLocationsConfig == null || officeLocationsConfig.isBlank()) {
            return false;
        }
        for (OfficeLocation loc : parseLocations(officeLocationsConfig)) {
            double distance = distanceMeters(latitude, longitude, loc.latitude, loc.longitude);
            double radius = loc.radiusMeters != null ? loc.radiusMeters : defaultGeoRadiusMeters;
            if (distance <= radius) {
                return true;
            }
        }
        return false;
    }

    private List<OfficeLocation> parseLocations(String raw) {
        List<OfficeLocation> locations = new ArrayList<>();
        String[] entries = raw.split(";");
        for (String entry : entries) {
            String[] parts = entry.trim().split(":");
            if (parts.length < 3) continue;
            try {
                double lat = Double.parseDouble(parts[1]);
                double lon = Double.parseDouble(parts[2]);
                Double radius = parts.length >= 4 ? Double.parseDouble(parts[3]) : null;
                locations.add(new OfficeLocation(parts[0], lat, lon, radius));
            } catch (NumberFormatException ignored) {
            }
        }
        return locations;
    }

    private double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return r * c;
    }

    private static class OfficeLocation {
        private final String name;
        private final double latitude;
        private final double longitude;
        private final Double radiusMeters;

        private OfficeLocation(String name, double latitude, double longitude, Double radiusMeters) {
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
            this.radiusMeters = radiusMeters;
        }
    }
}

