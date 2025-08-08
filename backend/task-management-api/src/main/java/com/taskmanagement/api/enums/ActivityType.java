package com.taskmanagement.api.enums;

import lombok.Getter;

@Getter
public enum ActivityType {
    // Task activities
    TASK_CREATED("Task Created", "Created a new task"),
    TASK_UPDATED("Task Updated", "Updated task details"),
    TASK_COMPLETED("Task Completed", "Marked task as completed"),
    TASK_DELETED("Task Deleted", "Deleted a task"),
    TASK_STATUS_CHANGED("Status Changed", "Changed task status"),
    TASK_PRIORITY_CHANGED("Priority Changed", "Changed task priority"),
    TASK_DUE_DATE_CHANGED("Due Date Changed", "Changed task due date"),
    TASK_ASSIGNED("Task Assigned", "Assigned task to project"),

    // Project activities
    PROJECT_CREATED("Project Created", "Created a new project"),
    PROJECT_UPDATED("Project Updated", "Updated project details"),
    PROJECT_COMPLETED("Project Completed", "Completed all project tasks"),
    PROJECT_DELETED("Project Deleted", "Deleted a project"),
    PROJECT_DEADLINE_CHANGED("Deadline Changed", "Changed project deadline"),

    // User activities
    USER_LOGGED_IN("Logged In", "User logged into the system"),
    USER_PROFILE_UPDATED("Profile Updated", "Updated profile information");

    private final String displayName;
    private final String description;

    ActivityType(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

}
