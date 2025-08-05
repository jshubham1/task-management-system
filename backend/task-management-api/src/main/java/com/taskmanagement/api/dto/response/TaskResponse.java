package com.taskmanagement.api.dto.response;

import com.taskmanagement.api.entity.Task;
import com.taskmanagement.api.enums.TaskPriority;
import com.taskmanagement.api.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {

    private UUID id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private String projectName;
    private UUID projectId;
    private List<AttachmentResponse> attachments;
    private Boolean isOverdue;
    private Boolean isDueToday;

    public static TaskResponse fromEntity(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .completedAt(task.getCompletedAt())
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .attachments(task.getAttachments() != null ?
                        task.getAttachments().stream()
                                .map(AttachmentResponse::fromEntity)
                                .collect(Collectors.toList()) : null)
                .isOverdue(task.isOverdue())
                .isDueToday(task.isDueToday())
                .build();
    }
}
