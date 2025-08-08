package com.taskmanagement.api.controller;

import com.taskmanagement.api.dto.response.ActivityResponse;
import com.taskmanagement.api.dto.response.DashboardSummaryResponse;
import com.taskmanagement.api.dto.response.ProjectStatsResponse;
import com.taskmanagement.api.dto.response.TaskStatsResponse;
import com.taskmanagement.api.security.UserPrincipal;
import com.taskmanagement.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@Tag(name = "Dashboard", description = "Dashboard data and analytics endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Retrieves overall dashboard statistics")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(currentUser.getId());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/task-stats")
    @Operation(summary = "Get task statistics", description = "Retrieves detailed task statistics")
    public ResponseEntity<TaskStatsResponse> getTaskStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "30") int days) {
        TaskStatsResponse stats = dashboardService.getTaskStatistics(currentUser.getId(), days);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/project-stats")
    @Operation(summary = "Get project statistics", description = "Retrieves project progress statistics")
    public ResponseEntity<ProjectStatsResponse> getProjectStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectStatsResponse stats = dashboardService.getProjectStatistics(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-activity")
    @Operation(summary = "Get recent activity", description = "Retrieves recent user activity")
    public ResponseEntity<List<ActivityResponse>> getRecentActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "10") int limit) {
        List<ActivityResponse> activities = dashboardService.getRecentActivity(currentUser.getId(), limit);
        return ResponseEntity.ok(activities);
    }
}
