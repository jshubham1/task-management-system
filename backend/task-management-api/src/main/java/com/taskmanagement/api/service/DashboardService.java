package com.taskmanagement.api.service;

import com.taskmanagement.api.dto.response.*;
import com.taskmanagement.api.enums.TaskPriority;
import com.taskmanagement.api.enums.TaskStatus;
import com.taskmanagement.api.repository.ProjectRepository;
import com.taskmanagement.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(UUID userId) {
        log.debug("Generating dashboard summary for user: {}", userId);

        // Task statistics
        Long totalTasks = taskRepository.countByUserIdAndIsDeletedFalse(userId);
        Long completedTasks = taskRepository.countByUserIdAndStatusAndIsDeletedFalse(userId, TaskStatus.DONE);
        Long pendingTasks = taskRepository.countByUserIdAndStatusNotAndIsDeletedFalse(userId, TaskStatus.DONE);
        Long overdueTasks = taskRepository.countByUserIdAndDueDateBeforeAndStatusNotAndIsDeletedFalse(
                userId, LocalDateTime.now(), TaskStatus.DONE);
        Long dueTodayTasks = taskRepository.countTasksDueToday(userId, LocalDateTime.now());

        // Project statistics
        Long totalProjects = projectRepository.countByUserId(userId);
        Long projectsWithDeadlines = projectRepository.countByUserIdAndDeadlineIsNotNull(userId);
        Long overdueProjects = projectRepository.countByUserIdAndDeadlineBefore(userId, LocalDateTime.now());

        // Calculate completion rate
        double completionRate = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;

        return DashboardSummaryResponse.builder()
                .totalTasks(totalTasks.intValue())
                .completedTasks(completedTasks.intValue())
                .pendingTasks(pendingTasks.intValue())
                .overdueTasks(overdueTasks.intValue())
                .dueTodayTasks(dueTodayTasks.intValue())
                .totalProjects(totalProjects.intValue())
                .projectsWithDeadlines(projectsWithDeadlines.intValue())
                .overdueProjects(overdueProjects.intValue())
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getTaskStatistics(UUID userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        Map<TaskStatus, Long> statusCounts = Arrays.stream(TaskStatus.values())
                .collect(Collectors.toMap(
                        status -> status,
                        status -> taskRepository.countByUserIdAndStatusAndIsDeletedFalse(userId, status)
                ));

        Map<TaskPriority, Long> priorityCounts = Arrays.stream(TaskPriority.values())
                .collect(Collectors.toMap(
                        priority -> priority,
                        priority -> taskRepository.countByUserIdAndPriorityAndIsDeletedFalse(userId, priority)
                ));

        // Daily task completion trend
        List<DailyTaskStats> dailyStats = taskRepository.getDailyTaskCompletionStats(userId, startDate);

        return TaskStatsResponse.builder()
                .statusCounts(statusCounts)
                .priorityCounts(priorityCounts)
                .dailyStats(dailyStats)
                .periodDays(days)
                .build();
    }

    // Add this method to your existing DashboardService

    @Transactional(readOnly = true)
    public ProjectStatsResponse getProjectStatistics(UUID userId) {
        log.debug("Generating project statistics for user: {}", userId);

        // Basic project counts
        Long totalProjects = projectRepository.countByUserId(userId);
        Long activeProjects = projectRepository.countActiveProjectsByUserId(userId);
        Long overdueProjects = projectRepository.countByUserIdAndDeadlineBefore(userId, LocalDateTime.now());
        Long upcomingDeadlines = projectRepository.countByUserIdAndDeadlineBetween(
                userId, LocalDateTime.now(), LocalDateTime.now().plusDays(7));

        // Calculate completed projects (projects with all tasks completed)
        Long completedProjects = projectRepository.countCompletedProjectsByUserId(userId);

        // Calculate average completion rate across all projects
        Double averageCompletionRate = projectRepository.getAverageCompletionRateByUserId(userId);

        // Get detailed project progress
        List<Object[]> projectProgressData = projectRepository.getProjectProgressStatsByUserId(userId);
        List<ProjectStatsResponse.ProjectProgressStats> projectProgress = projectProgressData.stream()
                .map(data -> {
                    UUID projectId = (UUID) data[0];
                    String projectName = (String) data[1];
                    String projectColor = (String) data[2];
                    Long totalTasksLong = (Long) data[3];
                    Long completedTasksLong = (Long) data[4];
                    LocalDateTime deadline = (LocalDateTime) data[5];

                    int totalTasks = totalTasksLong != null ? totalTasksLong.intValue() : 0;
                    int completedTasks = completedTasksLong != null ? completedTasksLong.intValue() : 0;
                    double progressPercentage = totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0;

                    boolean isOverdue = deadline != null && LocalDateTime.now().isAfter(deadline);
                    Integer daysUntilDeadline = deadline != null ?
                            (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), deadline) : null;

                    return ProjectStatsResponse.ProjectProgressStats.builder()
                            .projectId(projectId.toString())
                            .projectName(projectName)
                            .projectColor(projectColor)
                            .totalTasks(totalTasks)
                            .completedTasks(completedTasks)
                            .progressPercentage(Math.round(progressPercentage * 100.0) / 100.0)
                            .deadline(deadline)
                            .isOverdue(isOverdue)
                            .daysUntilDeadline(daysUntilDeadline)
                            .build();
                })
                .collect(Collectors.toList());

        // Get projects created by month for the last 12 months
        Map<String, Integer> projectsByMonth = projectRepository.getProjectsCreatedByMonth(userId, 12);

        return ProjectStatsResponse.builder()
                .totalProjects(totalProjects.intValue())
                .activeProjects(activeProjects.intValue())
                .completedProjects(completedProjects.intValue())
                .overdueProjects(overdueProjects.intValue())
                .projectsWithUpcomingDeadlines(upcomingDeadlines.intValue())
                .averageCompletionRate(averageCompletionRate != null ?
                        Math.round(averageCompletionRate * 100.0) / 100.0 : 0.0)
                .projectProgress(projectProgress)
                .projectsByMonth(projectsByMonth)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // Add this method to your existing DashboardService

    @Transactional(readOnly = true)
    public List<ActivityResponse> getRecentActivity(UUID userId, int limit) {
        log.debug("Fetching recent activity for user: {} with limit: {}", userId, limit);

        List<ActivityResponse> activities = new ArrayList<>();

        // Get recent task activities
        List<Object[]> taskActivities = taskRepository.getRecentTaskActivities(userId, limit);
        taskActivities.forEach(data -> {
            UUID taskId = (UUID) data[0];
            String taskTitle = (String) data[1];
            String activityType = (String) data[2];
            LocalDateTime timestamp = convertToLocalDateTime(data[3]); // Use utility method
            String oldValue = (String) data[4];
            String newValue = (String) data[5];

            Map<String, Object> metadata = new HashMap<>();
            if (oldValue != null) metadata.put("oldValue", oldValue);
            if (newValue != null) metadata.put("newValue", newValue);

            activities.add(ActivityResponse.fromTaskActivity(activityType, taskTitle, taskId, timestamp, metadata));
        });

        // Get recent project activities
        List<Object[]> projectActivities = projectRepository.getRecentProjectActivities(userId, limit);
        projectActivities.forEach(data -> {
            UUID projectId = (UUID) data[0];
            String projectName = (String) data[1];
            String activityType = (String) data[2];
            LocalDateTime timestamp = (LocalDateTime) data[3];

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("projectId", projectId.toString());

            activities.add(ActivityResponse.fromProjectActivity(activityType, projectName, projectId, timestamp, metadata));
        });

        // Sort all activities by timestamp (most recent first) and limit
        return activities.stream()
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    // Add this utility method to your DashboardService class
    private LocalDateTime convertToLocalDateTime(Object timestampObject) {
        if (timestampObject == null) {
            return null;
        }

        if (timestampObject instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) timestampObject).toLocalDateTime();
        } else if (timestampObject instanceof java.time.LocalDateTime) {
            return (java.time.LocalDateTime) timestampObject;
        } else {
            log.error("Unsupported timestamp type: {}", timestampObject.getClass());
            throw new IllegalArgumentException("Cannot convert " + timestampObject.getClass() + " to LocalDateTime");
        }
    }


}
