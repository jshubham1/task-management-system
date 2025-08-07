package com.taskmanagement.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionalAuthResponse {

    private Boolean authenticated;
    private UserResponse user;
    private String message;

    public static OptionalAuthResponse authenticated(UserResponse user) {
        return OptionalAuthResponse.builder()
                .authenticated(true)
                .user(user)
                .message("User authenticated successfully")
                .build();
    }

    public static OptionalAuthResponse unauthenticated() {
        return OptionalAuthResponse.builder()
                .authenticated(false)
                .user(null)
                .message("No valid authentication found")
                .build();
    }

    public static OptionalAuthResponse unauthenticated(String reason) {
        return OptionalAuthResponse.builder()
                .authenticated(false)
                .user(null)
                .message(reason)
                .build();
    }
}
