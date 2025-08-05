package com.taskmanagement.api.service;

import com.taskmanagement.api.dto.request.LoginRequest;
import com.taskmanagement.api.dto.request.RefreshTokenRequest;
import com.taskmanagement.api.dto.request.RegisterRequest;
import com.taskmanagement.api.dto.response.*;
import com.taskmanagement.api.entity.User;
import com.taskmanagement.api.entity.UserSession;
import com.taskmanagement.api.exception.AccountInactiveException;
import com.taskmanagement.api.exception.InvalidCredentialsException;
import com.taskmanagement.api.exception.UserAlreadyExistsException;
import com.taskmanagement.api.exception.UserNotFoundException;
import com.taskmanagement.api.repository.UserRepository;
import com.taskmanagement.api.repository.UserSessionRepository;
import com.taskmanagement.api.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@Transactional
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final UserSessionRepository userSessionRepository;

    public TokenResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        // Validate refresh token format and signature
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new InvalidCredentialsException("Invalid refresh token");
        }

        // Check if it's actually a refresh token
        String tokenType = jwtTokenProvider.getTokenType(refreshToken);
        if (!"refresh".equals(tokenType)) {
            throw new InvalidCredentialsException("Invalid token type");
        }

        // Get user from token
        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if user is active
        if (!user.getIsActive()) {
            throw new AccountInactiveException("Account is inactive");
        }

        // Verify refresh token exists in database
        UserSession session = userSessionRepository.findByRefreshTokenAndUserId(refreshToken, user.getId())
                .orElseThrow(() -> new InvalidCredentialsException("Refresh token not found"));

        // Check if session is valid
        if (!session.isValid()) {
            userSessionRepository.delete(session);
            throw new InvalidCredentialsException("Refresh token expired");
        }

        // Generate new tokens
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);

        // Update session with new refresh token
        session.setRefreshToken(newRefreshToken);
        session.setExpiresAt(LocalDateTime.now().plusSeconds(jwtTokenProvider.getRefreshTokenExpiration()));
        session.setLastUsedAt(LocalDateTime.now());
        userSessionRepository.save(session);

        return TokenResponse.success(
                newAccessToken,
                newRefreshToken,
                jwtTokenProvider.getAccessTokenExpiration(),
                jwtTokenProvider.getRefreshTokenExpiration()
        );
    }

    public MessageResponse logout(HttpServletRequest request) {
        String jwt = getJwtFromRequest(request);

        if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
            UUID userId = jwtTokenProvider.getUserIdFromToken(jwt);

            // Invalidate all refresh tokens for this user
            List<UserSession> sessions = userSessionRepository.findByUserIdAndIsActiveTrue(userId);
            sessions.forEach(session -> session.setIsActive(false));
            userSessionRepository.saveAll(sessions);

            log.info("User logged out successfully: {}", userId);
        }

        return MessageResponse.success("Logged out successfully");
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }


    public AuthResponse register(RegisterRequest request) {
        // Check if user exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        // Send verification email
        emailService.sendVerificationEmail(savedUser);

        return AuthResponse.builder()
                .message("Registration successful. Please check your email for verification.")
                .userId(savedUser.getId())
                .build();
    }

    public LoginResponse login(LoginRequest request) {
        // Authenticate user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid credentials");
        }

        if (!user.getIsActive()) {
            throw new AccountInactiveException("Account is inactive");
        }

        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserResponse.fromEntity(user))
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .build();
    }
}
