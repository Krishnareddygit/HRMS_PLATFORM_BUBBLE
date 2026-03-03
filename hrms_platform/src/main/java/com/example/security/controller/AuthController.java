package com.example.security.controller;

import com.example.security.dto.*;
import com.example.security.jwt.JwtService;
import com.example.security.model.User;
import com.example.security.model.Role;
import com.example.security.repository.UserRepository;
import com.example.security.service.UserService;
import com.example.EmployeeManagement.Repository.EmployeeRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private static final long QR_TTL_MS = 2 * 60 * 1000L;
    private final Map<String, QrSession> qrSessions = new ConcurrentHashMap<>();

    /**
     * Login endpoint: checks username/password and returns JWT
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        // Auto-link employee if missing before token generation
        user = userService.autoLinkEmployee(user);

        String jwtToken = jwtService.generateToken(user);

        return ResponseEntity.ok(
                new AuthResponse(jwtToken, user.isMustChangePassword())
        );
    }

    /**
     * Get profile for logged-in user
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        user = userService.autoLinkEmployee(user);
        Long employeeId = user.getEmployeeId();

        UserProfileResponse profile = new UserProfileResponse(
                user.getUsername(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()),
                employeeId
        );

        return ResponseEntity.ok(profile);
    }


    /**
     * Change password for logged-in user
     */
    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                               Principal principal) {
        userService.changePassword(principal.getName(), request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Stateless JWT logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody ForgotPasswordRequest request) {

        userService.generateResetToken(request.getUsername());

        // Always return same response (security best practice)
        return ResponseEntity.ok(
                "If the account exists, a password reset email has been sent"
        );
    }


    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(request);
            return ResponseEntity.ok("Password reset successful");
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/qr/status")
    public ResponseEntity<QrStatusResponse> qrStatus(@RequestParam("code") String code) {
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(new QrStatusResponse("invalid", null, null));
        }

        long now = System.currentTimeMillis();
        QrSession session = qrSessions.compute(code, (key, existing) -> {
            if (existing == null || existing.isExpired(now)) {
                return QrSession.waiting(now + QR_TTL_MS);
            }
            return existing;
        });

        if (session.isExpired(now)) {
            qrSessions.remove(code);
            return ResponseEntity.ok(new QrStatusResponse("expired", null, session.expiresAt));
        }

        String token = "approved".equals(session.status) ? session.token : null;
        return ResponseEntity.ok(new QrStatusResponse(session.status, token, session.expiresAt));
    }

    @PostMapping("/qr/confirm")
    public ResponseEntity<QrConfirmResponse> qrConfirm(@RequestBody QrConfirmRequest request, Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(401)
                    .body(new QrConfirmResponse(false, "Unauthorized", null));
        }

        String code = request != null ? request.getCode() : null;
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new QrConfirmResponse(false, "Invalid QR code", null));
        }

        long now = System.currentTimeMillis();
        QrSession session = qrSessions.compute(code, (key, existing) -> {
            if (existing == null || existing.isExpired(now)) {
                return QrSession.waiting(now + QR_TTL_MS);
            }
            return existing;
        });

        if (session.isExpired(now)) {
            qrSessions.remove(code);
            return ResponseEntity.status(410)
                    .body(new QrConfirmResponse(false, "QR code expired", null));
        }

        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        user = userService.autoLinkEmployee(user);

        String jwtToken = jwtService.generateToken(user);
        session.status = "approved";
        session.token = jwtToken;
        session.username = user.getUsername();

        QrLoginData loginData = new QrLoginData(
                jwtToken,
                user.getUsername(),
                user.getEmployeeId(),
                user.getRoles().stream().map(Role::getName).collect(Collectors.toSet())
        );

        return ResponseEntity.ok(new QrConfirmResponse(true, "QR login confirmed", loginData));
    }

    private static class QrSession {
        private String status;
        private String token;
        private Long expiresAt;
        private String username;

        private static QrSession waiting(long expiresAt) {
            QrSession session = new QrSession();
            session.status = "waiting";
            session.expiresAt = expiresAt;
            return session;
        }

        private boolean isExpired(long now) {
            return expiresAt != null && now > expiresAt;
        }
    }
}
