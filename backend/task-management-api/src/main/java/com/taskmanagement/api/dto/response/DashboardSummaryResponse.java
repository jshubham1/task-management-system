package com.taskmanagement.api.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer pendingTasks;
    private Integer overdueTasks;
    private Integer dueTodayTasks;
    private Integer totalProjects;
    private Integer projectsWithDeadlines;
    private Integer overdueProjects;
    private Double completionRate;
    private LocalDateTime generatedAt;
}

