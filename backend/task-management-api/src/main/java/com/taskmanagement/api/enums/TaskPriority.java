package com.taskmanagement.api.enums;

import lombok.Getter;

@Getter
public enum TaskPriority {
    LOW("Low", 1),
    MEDIUM("Medium", 2),
    HIGH("High", 3),
    CRITICAL("Critical", 4);

    private final String displayName;
    private final int priority;

    TaskPriority(String displayName, int priority) {
        this.displayName = displayName;
        this.priority = priority;
    }

    public static TaskPriority fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return MEDIUM; // Default value
        }

        try {
            return TaskPriority.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return MEDIUM; // Default fallback
        }
    }
}
