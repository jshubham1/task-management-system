package com.taskmanagement.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String message;
    private UUID userId;
    private Boolean success;

    public static AuthResponse success(String message, UUID userId) {
        return AuthResponse.builder()
                .message(message)
                .userId(userId)
                .success(true)
                .build();
    }

    public static AuthResponse error(String message) {
        return AuthResponse.builder()
                .message(message)
                .success(false)
                .build();
    }
}
