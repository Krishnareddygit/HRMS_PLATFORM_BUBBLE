package com.example.time.controller;

import com.example.time.dto.AttendanceDTO;
import com.example.time.mapper.AttendanceMapper;
import com.example.time.services.AttendanceService;
import com.example.security.jwt.JwtService;
import com.example.security.util.SecurityUtil;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

@RestController
@RequestMapping("/api/v1/hrms/time/attendance")
@AllArgsConstructor
@Slf4j
public class AttendanceController {

    private AttendanceService attendanceService;
    private SecurityUtil securityUtil;
    private JwtService jwtService;

    /**
     * POST /api/v1/hrms/time/attendance/check-in
     */
    @PreAuthorize("""
        hasAnyRole('EMPLOYEE','HR_OPERATIONS','HR_BP','HR_PAYROLL','TALENT_ACQUISITION','ADMIN')
        and @securityUtil.isSelf(#employeeId)
    """)
    @PostMapping("/check-in")
    public AttendanceDTO checkIn(
            @RequestParam long employeeId,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            HttpServletRequest request
    ) {
        String ipAddress = resolveClientIp(request);
        return AttendanceMapper.toDTO(attendanceService.checkIn(employeeId, source, latitude, longitude, ipAddress));
    }

    /**
     * POST /api/v1/hrms/time/attendance/check-in/me
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/check-in/me")
    public AttendanceDTO checkInForMe(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            HttpServletRequest request
    ) {
        long employeeId = resolveEmployeeIdForCurrentUser(request);
        String ipAddress = resolveClientIp(request);
        return AttendanceMapper.toDTO(attendanceService.checkIn(employeeId, source, latitude, longitude, ipAddress));
    }

    /**
     * POST /api/v1/hrms/time/attendance/check-out
     */
    @PreAuthorize("""
        hasAnyRole('EMPLOYEE','HR_OPERATIONS','HR_BP','HR_PAYROLL','TALENT_ACQUISITION','ADMIN')
        and @securityUtil.isSelf(#employeeId)
    """)
    @PostMapping("/check-out")
    public AttendanceDTO checkOut(
            @RequestParam long employeeId,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            HttpServletRequest request
    ) {
        String ipAddress = resolveClientIp(request);
        return AttendanceMapper.toDTO(attendanceService.checkOut(employeeId, source, latitude, longitude, ipAddress));
    }

    /**
     * POST /api/v1/hrms/time/attendance/check-out/me
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/check-out/me")
    public AttendanceDTO checkOutForMe(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            HttpServletRequest request
    ) {
        long employeeId = resolveEmployeeIdForCurrentUser(request);
        String ipAddress = resolveClientIp(request);
        return AttendanceMapper.toDTO(attendanceService.checkOut(employeeId, source, latitude, longitude, ipAddress));
    }

    /**
     * GET /api/v1/hrms/time/attendance/{employeeId}
     */
    @PreAuthorize("""
        hasAnyRole('HR_OPERATIONS','ADMIN')
        or (hasRole('EMPLOYEE') and @securityUtil.isSelf(#employeeId))
    """)

    @GetMapping("/{employeeId}")
    public List<AttendanceDTO> getAttendance(@PathVariable long employeeId) {
        return attendanceService.getEmployeeAttendance(employeeId)
                .stream()
                .map(AttendanceMapper::toDTO)
                .toList();
    }

    /**
     * GET /api/v1/hrms/time/attendance/me
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public List<AttendanceDTO> getAttendanceForMe() {
        long employeeId = resolveEmployeeIdForCurrentUser(null);
        return attendanceService.getEmployeeAttendance(employeeId)
                .stream()
                .map(AttendanceMapper::toDTO)
                .toList();
    }

    private long resolveEmployeeIdForCurrentUser(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : null;
        if (username == null || username.isBlank()) {
            log.warn("Attendance resolve: missing username in security context. authPresent={}", auth != null);
        } else {
            log.warn("Attendance resolve: username={}", username);
        }

        return securityUtil.getLoggedInEmployeeOptional()
                .map(emp -> emp.getEmployeeId())
                .orElseGet(() -> {
                    Long extractedEmployeeId = null;
                    if (request != null) {
                        String authHeader = request.getHeader("Authorization");
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            String jwt = authHeader.substring(7);
                            extractedEmployeeId = jwtService.extractEmployeeId(jwt);
                            if (extractedEmployeeId != null) {
                                log.warn("Attendance resolve: employeeId from JWT={}", extractedEmployeeId);
                                return extractedEmployeeId;
                            }
                        }
                    }
                    boolean authHeaderPresent = request != null && request.getHeader("Authorization") != null;
                    log.warn(
                            "Attendance resolve failed. username={} authHeaderPresent={} jwtEmployeeId={}",
                            username,
                            authHeaderPresent,
                            extractedEmployeeId
                    );
                    throw new RuntimeException(
                            "Logged-in employee not found. username=" + username
                                    + " authHeaderPresent=" + authHeaderPresent
                                    + " jwtEmployeeId=" + extractedEmployeeId
                    );
                });
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Take first IP in list
            String first = forwarded.split(",")[0].trim();
            return stripPort(first);
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return stripPort(realIp.trim());
        }
        return stripPort(request.getRemoteAddr());
    }

    private String stripPort(String ip) {
        int idx = ip.indexOf(':');
        if (idx > -1 && ip.indexOf('.') > -1) {
            return ip.substring(0, idx);
        }
        return ip;
    }
}

