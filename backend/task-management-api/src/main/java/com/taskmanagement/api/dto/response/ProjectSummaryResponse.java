package com.taskmanagement.api.dto.response;

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
public class ProjectSummaryResponse {

    private UUID id;
    private String name;
    private String color;
    private Integer totalTasks;
    private Integer completedTasks;
    private Double progress;
    private LocalDateTime deadline;
    private Boolean isOverdue;

    public ProjectSummaryResponse(UUID id, String name, String color, Integer totalTasks, Integer completedTasks, LocalDateTime deadline) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.progress = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;
        this.deadline = deadline;
        this.isOverdue = deadline != null && LocalDateTime.now().isAfter(deadline);
    }
}
