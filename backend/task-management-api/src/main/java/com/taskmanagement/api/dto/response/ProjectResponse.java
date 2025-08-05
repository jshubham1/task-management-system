package com.taskmanagement.api.dto.response;

import com.taskmanagement.api.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectResponse {

    private UUID id;
    private String name;
    private String description;
    private String color;
    private LocalDateTime deadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer taskCount;
    private Integer completedTaskCount;
    private Double progress;
    private Boolean isOverdue;

    public static ProjectResponse fromEntity(Project project) {
        boolean isOverdue = project.getDeadline() != null &&
                LocalDateTime.now().isAfter(project.getDeadline());

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .color(project.getColor())
                .deadline(project.getDeadline())
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .taskCount(project.getTaskCount())
                .completedTaskCount(project.getCompletedTaskCount())
                .progress(project.getProgress())
                .isOverdue(isOverdue)
                .build();
    }
}
