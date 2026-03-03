package com.example.security.oauth;

import com.example.security.jwt.JwtService;
import com.example.security.model.User;
import com.example.security.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler
        implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");

        if (email == null || email.isBlank()) {
            redirectToError(response, "missing_email");
            return;
        }

        User user = userRepository.findByUsername(email).orElse(null);
        if (user == null) {
            redirectToError(response, "not_registered");
            return;
        }

        String token = jwtService.generateToken(user);
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/oauth/redirect?token=" + encodedToken);
    }

    private void redirectToError(HttpServletResponse response, String reason) throws IOException {
        String encodedReason = URLEncoder.encode(reason, StandardCharsets.UTF_8);
        response.sendRedirect(frontendUrl + "/oauth/error?reason=" + encodedReason);
    }
}
