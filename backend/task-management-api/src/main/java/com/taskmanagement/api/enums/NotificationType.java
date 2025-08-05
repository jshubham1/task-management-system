package com.taskmanagement.api.enums;

import lombok.Getter;

@Getter
public enum NotificationType {
    TASK_DUE_SOON("Task Due Soon", "A task is due within 24 hours"),
    TASK_OVERDUE("Task Overdue", "A task has passed its due date"),
    TASK_COMPLETED("Task Completed", "A task has been marked as completed"),
    TASK_ASSIGNED("Task Assigned", "A new task has been assigned"),
    PROJECT_DEADLINE("Project Deadline", "A project deadline is approaching"),
    SYSTEM_NOTIFICATION("System Notification", "System maintenance or updates");

    private final String title;
    private final String defaultMessage;

    NotificationType(String title, String defaultMessage) {
        this.title = title;
        this.defaultMessage = defaultMessage;
    }

}
