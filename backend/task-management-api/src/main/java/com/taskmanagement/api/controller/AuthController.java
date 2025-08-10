package com.taskmanagement.api.controller;

import com.taskmanagement.api.dto.request.LoginRequest;
import com.taskmanagement.api.dto.request.RefreshTokenRequest;
import com.taskmanagement.api.dto.request.RegisterRequest;
import com.taskmanagement.api.dto.response.*;
import com.taskmanagement.api.security.UserPrincipal;
import com.taskmanagement.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@Tag(name = "Authentication", description = "User authentication and authorization endpoints")
@Slf4j
public class AuthController {
    private final AuthService authService;

    @Operation(
            summary = "Register a new user",
            description = "Creates a new user account with email verification",
            responses = {
                    @ApiResponse(responseCode = "201", description = "User registered successfully"),
                    @ApiResponse(responseCode = "400", description = "Validation failed"),
                    @ApiResponse(responseCode = "409", description = "User already exists")
            }
    )
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("POST /api/auth/register - email={} username={}", request.getEmail(), request.getUsername());
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "User login",
            description = "Authenticates user and returns JWT tokens",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Login successful"),
                    @ApiResponse(responseCode = "401", description = "Invalid credentials")
            }
    )
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /api/auth/login - email={}", request.getEmail());
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(
            summary = "Refresh access token",
            description = "Exchanges a valid refresh token for a new access token"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid refresh token"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        log.info("POST /api/auth/refresh - refreshToken (masked) present={}", request.getRefreshToken() != null);
        TokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Logout current user",
            description = "Invalidates the current user's active tokens"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Logged out successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
        log.info("POST /api/auth/logout - remoteAddr={} userAgent={}", request.getRemoteAddr(), request.getHeader("User-Agent"));
        authService.logout(request);
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    // NEW ENDPOINT: Get current user information
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    @Operation(
            summary = "Get current user information",
            description = "Fetches information about the currently authenticated user",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User information retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or expired token")
            }
    )
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal currentUser) {
        log.debug("GET /api/auth/me - userId={}", currentUser.getId());
        UserResponse userResponse = authService.getCurrentUser(currentUser.getId());
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/me/optional")
    @Operation(
            summary = "Get current user (optional authentication)",
            description = "Returns user info if valid authentication is provided, otherwise returns appropriate error status",
            responses = {
                    @ApiResponse(responseCode = "200", description = "User authenticated successfully"),
                    @ApiResponse(responseCode = "400", description = "Bad request - invalid token format"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized - missing, invalid, or expired token"),
                    @ApiResponse(responseCode = "403", description = "Forbidden - valid token but account issues"),
                    @ApiResponse(responseCode = "404", description = "Not found - user account not found"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    public ResponseEntity<OptionalAuthResponse> getCurrentUserOptional(@Parameter(description = "HTTP request with optional Authorization header") HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        log.debug("GET /api/auth/me/optional - hasAuthHeader={}", authHeader != null && !authHeader.isBlank());
        String authorizationHeader = request.getHeader("Authorization");
        OptionalAuthResponse response = authService.getCurrentUserOptional(authorizationHeader);

        // Return appropriate HTTP status based on the response
        return ResponseEntity.status(response.getHttpStatus()).body(response);
    }


}
