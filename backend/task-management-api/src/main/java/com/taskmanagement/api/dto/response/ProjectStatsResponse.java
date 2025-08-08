package com.taskmanagement.api.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectStatsResponse {

    private Integer totalProjects;
    private Integer activeProjects;
    private Integer completedProjects;
    private Integer overdueProjects;
    private Integer projectsWithUpcomingDeadlines;
    private Double averageCompletionRate;
    private List<ProjectProgressStats> projectProgress;
    private Map<String, Integer> projectsByMonth;
    private LocalDateTime generatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProjectProgressStats {
        private String projectId;
        private String projectName;
        private String projectColor;
        private Integer totalTasks;
        private Integer completedTasks;
        private Double progressPercentage;
        private LocalDateTime deadline;
        private Boolean isOverdue;
        private Integer daysUntilDeadline;
    }
}
