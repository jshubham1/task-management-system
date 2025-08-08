package com.taskmanagement.api.dto.response;

import com.taskmanagement.api.enums.TaskPriority;
import com.taskmanagement.api.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatsResponse {
    private Map<TaskStatus, Long> statusCounts;
    private Map<TaskPriority, Long> priorityCounts;
    private List<DailyTaskStats> dailyStats;
    private Integer periodDays;
}
