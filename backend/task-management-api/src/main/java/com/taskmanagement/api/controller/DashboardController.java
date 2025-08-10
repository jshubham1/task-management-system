package com.taskmanagement.api.controller;

import com.taskmanagement.api.dto.response.ActivityResponse;
import com.taskmanagement.api.dto.response.DashboardSummaryResponse;
import com.taskmanagement.api.dto.response.ProjectStatsResponse;
import com.taskmanagement.api.dto.response.TaskStatsResponse;
import com.taskmanagement.api.security.UserPrincipal;
import com.taskmanagement.api.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary", description = "Retrieves overall dashboard statistics")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Summary retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        log.debug("GET /api/dashboard/summary - userId={}", currentUser.getId());
        DashboardSummaryResponse summary = dashboardService.getDashboardSummary(currentUser.getId());
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/task-stats")
    @Operation(summary = "Get task statistics", description = "Retrieves detailed task statistics")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task stats retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<TaskStatsResponse> getTaskStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Number of days to include in stats") @RequestParam(defaultValue = "30") int days) {
        log.debug("GET /api/dashboard/task-stats - userId={} days={}", currentUser.getId(), days);
        TaskStatsResponse stats = dashboardService.getTaskStatistics(currentUser.getId(), days);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/project-stats")
    @Operation(summary = "Get project statistics", description = "Retrieves project progress statistics")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Project stats retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ProjectStatsResponse> getProjectStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        log.debug("GET /api/dashboard/project-stats - userId={}", currentUser.getId());
        ProjectStatsResponse stats = dashboardService.getProjectStatistics(currentUser.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-activity")
    @Operation(summary = "Get recent activity", description = "Retrieves recent user activity")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Recent activity retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<ActivityResponse>> getRecentActivity(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Maximum number of activity items") @RequestParam(defaultValue = "10") int limit) {
        log.debug("GET /api/dashboard/recent-activity - userId={} limit={}", currentUser.getId(), limit);
        List<ActivityResponse> activities = dashboardService.getRecentActivity(currentUser.getId(), limit);
        return ResponseEntity.ok(activities);
    }
}
