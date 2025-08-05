package com.taskmanagement.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectCreateRequest {

    @NotBlank(message = "Project name is required")
    @Size(max = 80, message = "Project name must not exceed 80 characters")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Pattern(regexp = "^#([0-9A-Fa-f]{6})$", message = "Color must be a valid hex color code")
    @Builder.Default
    private String color = "#2196F3";

    private LocalDateTime deadline;
}
