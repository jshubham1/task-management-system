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
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

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
        //emailService.sendVerificationEmail(savedUser);

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

    @Transactional
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // Additional checks
        if (!user.getIsActive()) {
            throw new AccountInactiveException("User account is inactive");
        }

        if (!user.getEmailVerified()) {
            log.warn("Unverified user accessing /me endpoint: {}", user.getEmail());
        }

        // Update last access time (optional)
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return UserResponse.fromEntity(user);
    }

    // Add this method to your existing AuthService class
    @Transactional
    public OptionalAuthResponse getCurrentUserOptional(String authorizationHeader) {
        String clientInfo = getCurrentClientInfo();

        try {
            String jwt = extractJwtFromAuthHeader(authorizationHeader);

            if (!StringUtils.hasText(jwt)) {
                log.debug("No JWT token found in optional auth request from: {}", clientInfo);
                return OptionalAuthResponse.unauthenticated("No authorization token provided");
            }

            // Validate token structure and signature
            if (!jwtTokenProvider.validateToken(jwt)) {
                log.debug("Invalid JWT token in optional auth request from: {}", clientInfo);
                return OptionalAuthResponse.unauthenticated("Invalid or expired token");
            }

            // Check token type (should be access token, not refresh token)
            String tokenType = jwtTokenProvider.getTokenType(jwt);
            if (!"access".equals(tokenType)) {
                log.debug("Wrong token type '{}' in optional auth request from: {}", tokenType, clientInfo);
                return OptionalAuthResponse.unauthenticated("Invalid token type");
            }

            // Extract user information
            String username = jwtTokenProvider.getUsernameFromToken(jwt);
            UUID userId = jwtTokenProvider.getUserIdFromToken(jwt);

            log.debug("Processing optional auth for user: {} (ID: {}) from: {}", username, userId, clientInfo);

            // Find user by ID for better performance
            User user = userRepository.findById(userId)
                    .orElse(null);

            if (user == null) {
                log.warn("User not found for ID: {} from token, client: {}", userId, clientInfo);
                return OptionalAuthResponse.unauthenticated("User not found");
            }

            // Verify username matches (security check)
            if (!username.equals(user.getUsername())) {
                log.error("Username mismatch in token. Expected: {}, Got: {} from client: {}",
                        user.getUsername(), username, clientInfo);
                return OptionalAuthResponse.unauthenticated("Token validation failed");
            }

            // Check user status
            if (!user.getIsActive()) {
                log.warn("Inactive user {} attempting optional access from: {}", username, clientInfo);
                return OptionalAuthResponse.unauthenticated("User account is inactive");
            }

            // Update last login time (optional - only if you want to track this)
            updateUserLastAccess(user);

            // Create response
            UserResponse userResponse = UserResponse.fromEntity(user);

            log.debug("Successfully processed optional auth for user: {} from: {}", username, clientInfo);

            return OptionalAuthResponse.authenticated(userResponse);

        } catch (ExpiredJwtException ex) {
            log.debug("Expired JWT token in optional auth request from: {} - {}", clientInfo, ex.getMessage());
            return OptionalAuthResponse.unauthenticated("Token has expired");
        } catch (UnsupportedJwtException ex) {
            log.debug("Unsupported JWT token in optional auth request from: {} - {}", clientInfo, ex.getMessage());
            return OptionalAuthResponse.unauthenticated("Unsupported token format");
        } catch (MalformedJwtException ex) {
            log.debug("Malformed JWT token in optional auth request from: {} - {}", clientInfo, ex.getMessage());
            return OptionalAuthResponse.unauthenticated("Invalid token format");
        } catch (IllegalArgumentException ex) {
            log.debug("Invalid JWT arguments in optional auth request from: {} - {}", clientInfo, ex.getMessage());
            return OptionalAuthResponse.unauthenticated("Invalid token data");
        } catch (Exception ex) {
            log.error("Unexpected error during optional authentication check from: {} - {}",
                    clientInfo, ex.getMessage(), ex);
            return OptionalAuthResponse.unauthenticated("Authentication check failed");
        }
    }

    private String extractJwtFromAuthHeader(String authorizationHeader) {
        if (StringUtils.hasText(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7).trim();
            return StringUtils.hasText(token) ? token : null;
        }
        return null;
    }

    private String getCurrentClientInfo() {
        // Get client info from request context if available
        try {
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                    .getRequest();
            String userAgent = request.getHeader("User-Agent");
            String clientIp = getClientIpAddress(request);
            return String.format("IP: %s, UA: %s", clientIp, userAgent);
        } catch (Exception e) {
            return "Unknown client";
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    private void updateUserLastAccess(User user) {
        // Only update if last access was more than 5 minutes ago to avoid too frequent updates
        if (user.getLastLoginAt() == null ||
                user.getLastLoginAt().isBefore(LocalDateTime.now().minusMinutes(5))) {
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }
}