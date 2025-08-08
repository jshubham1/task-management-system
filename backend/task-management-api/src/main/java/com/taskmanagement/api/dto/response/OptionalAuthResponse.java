package com.taskmanagement.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptionalAuthResponse {

    private Boolean authenticated;
    private UserResponse user;
    private String message;
    private HttpStatus httpStatus; // Add HTTP status for internal use

    public static OptionalAuthResponse authenticated(UserResponse user) {
        return OptionalAuthResponse.builder()
                .authenticated(true)
                .user(user)
                .message("User authenticated successfully")
                .httpStatus(HttpStatus.OK)
                .build();
    }

    public static OptionalAuthResponse unauthorized(String reason) {
        return OptionalAuthResponse.builder()
                .authenticated(false)
                .user(null)
                .message(reason)
                .httpStatus(HttpStatus.UNAUTHORIZED)
                .build();
    }

    public static OptionalAuthResponse forbidden(String reason) {
        return OptionalAuthResponse.builder()
                .authenticated(false)
                .user(null)
                .message(reason)
                .httpStatus(HttpStatus.FORBIDDEN)
                .build();
    }

    public static OptionalAuthResponse notFound(String reason) {
        return OptionalAuthResponse.builder()
                .authenticated(false)
                .user(null)
                .message(reason)
                .httpStatus(HttpStatus.NOT_FOUND)
                .build();
    }

    public static OptionalAuthResponse badRequest(String reason) {
        return OptionalAuthResponse.builder()
                .authenticated(false)
                .user(null)
                .message(reason)
                .httpStatus(HttpStatus.BAD_REQUEST)
                .build();
    }
}
