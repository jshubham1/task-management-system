package com.taskmanagement.api.controller;

import com.taskmanagement.api.dto.request.LoginRequest;
import com.taskmanagement.api.dto.request.RefreshTokenRequest;
import com.taskmanagement.api.dto.request.RegisterRequest;
import com.taskmanagement.api.dto.response.*;
import com.taskmanagement.api.security.UserPrincipal;
import com.taskmanagement.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        TokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request) {
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
        UserResponse userResponse = authService.getCurrentUser(currentUser.getId());
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/me/optional")
    @Operation(
            summary = "Get current user (optional authentication)",
            description = "Returns user info if valid authentication is provided, otherwise returns unauthenticated status",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Always returns 200 with authentication status"),
                    @ApiResponse(responseCode = "500", description = "Server error")
            }
    )
    public ResponseEntity<OptionalAuthResponse> getCurrentUserOptional(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        OptionalAuthResponse response = authService.getCurrentUserOptional(authorizationHeader);
        return ResponseEntity.ok(response);
    }


}
