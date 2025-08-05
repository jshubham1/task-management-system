package com.taskmanagement.api.dto.request;

import com.taskmanagement.api.enums.TaskPriority;
import com.taskmanagement.api.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskFilterRequest {

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 20;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDirection = "desc";

    private TaskStatus status;

    private TaskPriority priority;

    private UUID projectId;

    private String search;

    private LocalDate startDate;

    private LocalDate endDate;

    private Boolean overdue;

    private Boolean dueToday;
}
