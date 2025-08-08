package com.taskmanagement.api.dto.response;

import com.taskmanagement.api.enums.ActivityType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {

    private UUID id;
    private ActivityType type;
    private String title;
    private String description;
    private String entityType; // "TASK", "PROJECT", "USER"
    private UUID entityId;
    private String entityName;
    private Map<String, Object> metadata;
    private LocalDateTime timestamp;
    private String timeAgo; // "2 hours ago", "1 day ago"
    private String icon; // Icon identifier for frontend
    private String color; // Color for activity type

    public static ActivityResponse fromTaskActivity(String type, String taskTitle, UUID taskId, LocalDateTime timestamp, Map<String, Object> metadata) {
        return ActivityResponse.builder()
                .id(UUID.randomUUID())
                .type(ActivityType.valueOf(type))
                .title(getTaskActivityTitle(type, taskTitle))
                .description(getTaskActivityDescription(type, taskTitle))
                .entityType("TASK")
                .entityId(taskId)
                .entityName(taskTitle)
                .metadata(metadata)
                .timestamp(timestamp)
                .timeAgo(calculateTimeAgo(timestamp))
                .icon(getTaskActivityIcon(type))
                .color(getTaskActivityColor(type))
                .build();
    }

    public static ActivityResponse fromProjectActivity(String type, String projectName, UUID projectId, LocalDateTime timestamp, Map<String, Object> metadata) {
        return ActivityResponse.builder()
                .id(UUID.randomUUID())
                .type(ActivityType.valueOf(type))
                .title(getProjectActivityTitle(type, projectName))
                .description(getProjectActivityDescription(type, projectName))
                .entityType("PROJECT")
                .entityId(projectId)
                .entityName(projectName)
                .metadata(metadata)
                .timestamp(timestamp)
                .timeAgo(calculateTimeAgo(timestamp))
                .icon(getProjectActivityIcon(type))
                .color(getProjectActivityColor(type))
                .build();
    }

    private static String getTaskActivityTitle(String type, String taskTitle) {
        return switch (type) {
            case "TASK_CREATED" -> "Created task";
            case "TASK_COMPLETED" -> "Completed task";
            case "TASK_UPDATED" -> "Updated task";
            case "TASK_DELETED" -> "Deleted task";
            case "TASK_STATUS_CHANGED" -> "Changed task status";
            case "TASK_PRIORITY_CHANGED" -> "Changed task priority";
            default -> "Task activity";
        };
    }

    private static String getTaskActivityDescription(String type, String taskTitle) {
        return switch (type) {
            case "TASK_CREATED" -> String.format("Created new task '%s'", taskTitle);
            case "TASK_COMPLETED" -> String.format("Marked task '%s' as completed", taskTitle);
            case "TASK_UPDATED" -> String.format("Updated task '%s'", taskTitle);
            case "TASK_DELETED" -> String.format("Deleted task '%s'", taskTitle);
            case "TASK_STATUS_CHANGED" -> String.format("Changed status of task '%s'", taskTitle);
            case "TASK_PRIORITY_CHANGED" -> String.format("Changed priority of task '%s'", taskTitle);
            default -> String.format("Activity on task '%s'", taskTitle);
        };
    }

    private static String getProjectActivityTitle(String type, String projectName) {
        return switch (type) {
            case "PROJECT_CREATED" -> "Created project";
            case "PROJECT_COMPLETED" -> "Completed project";
            case "PROJECT_UPDATED" -> "Updated project";
            case "PROJECT_DELETED" -> "Deleted project";
            default -> "Project activity";
        };
    }

    private static String getProjectActivityDescription(String type, String projectName) {
        return switch (type) {
            case "PROJECT_CREATED" -> String.format("Created new project '%s'", projectName);
            case "PROJECT_COMPLETED" -> String.format("Completed project '%s'", projectName);
            case "PROJECT_UPDATED" -> String.format("Updated project '%s'", projectName);
            case "PROJECT_DELETED" -> String.format("Deleted project '%s'", projectName);
            default -> String.format("Activity on project '%s'", projectName);
        };
    }

    private static String getTaskActivityIcon(String type) {
        return switch (type) {
            case "TASK_CREATED" -> "add_circle";
            case "TASK_COMPLETED" -> "check_circle";
            case "TASK_UPDATED" -> "edit";
            case "TASK_DELETED" -> "delete";
            case "TASK_STATUS_CHANGED" -> "sync";
            case "TASK_PRIORITY_CHANGED" -> "priority_high";
            default -> "task";
        };
    }

    private static String getProjectActivityIcon(String type) {
        return switch (type) {
            case "PROJECT_CREATED" -> "folder_add";
            case "PROJECT_COMPLETED" -> "folder_check";
            case "PROJECT_UPDATED" -> "folder_edit";
            case "PROJECT_DELETED" -> "folder_delete";
            default -> "folder";
        };
    }

    private static String getTaskActivityColor(String type) {
        return switch (type) {
            case "TASK_CREATED" -> "#4CAF50"; // Green
            case "TASK_COMPLETED" -> "#2196F3"; // Blue
            case "TASK_UPDATED" -> "#FF9800"; // Orange
            case "TASK_DELETED" -> "#F44336"; // Red
            case "TASK_STATUS_CHANGED" -> "#9C27B0"; // Purple
            case "TASK_PRIORITY_CHANGED" -> "#FF5722"; // Deep Orange
            default -> "#757575"; // Grey
        };
    }

    private static String getProjectActivityColor(String type) {
        return switch (type) {
            case "PROJECT_CREATED" -> "#4CAF50"; // Green
            case "PROJECT_COMPLETED" -> "#2196F3"; // Blue
            case "PROJECT_UPDATED" -> "#FF9800"; // Orange
            case "PROJECT_DELETED" -> "#F44336"; // Red
            default -> "#757575"; // Grey
        };
    }

    private static String calculateTimeAgo(LocalDateTime timestamp) {
        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(timestamp, now).toMinutes();

        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";

        long hours = minutes / 60;
        if (hours < 24) return hours + " hour" + (hours > 1 ? "s" : "") + " ago";

        long days = hours / 24;
        if (days < 30) return days + " day" + (days > 1 ? "s" : "") + " ago";

        long months = days / 30;
        if (months < 12) return months + " month" + (months > 1 ? "s" : "") + " ago";

        long years = months / 12;
        return years + " year" + (years > 1 ? "s" : "") + " ago";
    }
}
