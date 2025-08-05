package com.taskmanagement.api.enums;

import lombok.Getter;

@Getter
public enum TaskStatus {
    TODO("To Do", "todo"),
    IN_PROGRESS("In Progress", "in-progress"),
    DONE("Done", "done"),
    CANCELLED("Cancelled", "cancelled");

    private final String displayName;
    private final String cssClass;

    TaskStatus(String displayName, String cssClass) {
        this.displayName = displayName;
        this.cssClass = cssClass;
    }

    public static TaskStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return TODO; // Default value
        }

        try {
            return TaskStatus.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TODO; // Default fallback
        }
    }

    public boolean isCompleted() {
        return this == DONE;
    }

    public boolean canTransitionTo(TaskStatus newStatus) {
        // Define valid transitions
        switch (this) {
            case TODO:
                return newStatus == IN_PROGRESS || newStatus == CANCELLED;
            case IN_PROGRESS:
                return newStatus == DONE || newStatus == TODO || newStatus == CANCELLED;
            case DONE:
                return newStatus == IN_PROGRESS; // Allow reopening completed tasks
            case CANCELLED:
                return newStatus == TODO || newStatus == IN_PROGRESS;
            default:
                return false;
        }
    }
}
