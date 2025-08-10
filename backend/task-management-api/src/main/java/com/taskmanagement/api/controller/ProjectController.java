package com.taskmanagement.api.controller;

import com.taskmanagement.api.dto.request.ProjectCreateRequest;
import com.taskmanagement.api.dto.request.ProjectUpdateRequest;
import com.taskmanagement.api.dto.response.MessageResponse;
import com.taskmanagement.api.dto.response.ProjectResponse;
import com.taskmanagement.api.dto.response.ProjectSummaryResponse;
import com.taskmanagement.api.security.UserPrincipal;
import com.taskmanagement.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@Tag(name = "Projects", description = "Project management endpoints")
@Slf4j
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(
            summary = "Get user projects",
            description = "Retrieves all projects belonging to the authenticated user",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Projects retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<List<ProjectResponse>> getUserProjects(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        log.debug("GET /api/projects - userId={}", currentUser.getId());
        List<ProjectResponse> projects = projectService.getProjectsByUser(currentUser.getId());
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/summary")
    @Operation(
            summary = "Get project summaries",
            description = "Retrieves project summaries with task statistics for dashboard",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Project summaries retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<List<ProjectSummaryResponse>> getProjectSummaries(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        log.debug("GET /api/projects/summary - userId={}", currentUser.getId());
        List<ProjectSummaryResponse> summaries = projectService.getProjectSummaries(currentUser.getId());
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/{projectId}")
    @Operation(
            summary = "Get project by ID",
            description = "Retrieves a specific project by its ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Project retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Project not found"),
                    @ApiResponse(responseCode = "403", description = "Access denied"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<ProjectResponse> getProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Project ID") @PathVariable UUID projectId) {
        log.debug("GET /api/projects/{} - userId={}", projectId, currentUser.getId());
        ProjectResponse project = projectService.getProject(currentUser.getId(), projectId);
        return ResponseEntity.ok(project);
    }

    @PostMapping
    @Operation(
            summary = "Create new project",
            description = "Creates a new project for the authenticated user",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Project created successfully"),
                    @ApiResponse(responseCode = "400", description = "Validation failed"),
                    @ApiResponse(responseCode = "409", description = "Project name already exists"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<ProjectResponse> createProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ProjectCreateRequest request) {
        log.info("POST /api/projects - userId={} name={}", currentUser.getId(), request.getName());
        ProjectResponse project = projectService.createProject(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @PutMapping("/{projectId}")
    @Operation(
            summary = "Update project",
            description = "Updates an existing project",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Project updated successfully"),
                    @ApiResponse(responseCode = "400", description = "Validation failed"),
                    @ApiResponse(responseCode = "404", description = "Project not found"),
                    @ApiResponse(responseCode = "403", description = "Access denied"),
                    @ApiResponse(responseCode = "409", description = "Project name already exists"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<ProjectResponse> updateProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Project ID") @PathVariable UUID projectId,
            @Valid @RequestBody ProjectUpdateRequest request) {
        log.info("PUT /api/projects/{} - userId={} name={} descriptionUpdated={} ",
                projectId, currentUser.getId(), request.getName(), request.getDescription() != null);
        ProjectResponse project = projectService.updateProject(currentUser.getId(), projectId, request);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{projectId}")
    @Operation(
            summary = "Delete project",
            description = "Deletes a project and all its associated tasks",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Project deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Project not found"),
                    @ApiResponse(responseCode = "403", description = "Access denied"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<MessageResponse> deleteProject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Project ID") @PathVariable UUID projectId) {
        log.info("DELETE /api/projects/{} - userId={}", projectId, currentUser.getId());
        projectService.deleteProject(currentUser.getId(), projectId);
        return ResponseEntity.ok(MessageResponse.success("Project deleted successfully"));
    }

    @GetMapping("/search")
    @Operation(
            summary = "Search projects",
            description = "Search projects by name or description",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Search results retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<List<ProjectResponse>> searchProjects(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Search term") @RequestParam String query) {
        log.debug("GET /api/projects/search - userId={} query={}", currentUser.getId(), query);
        List<ProjectResponse> projects = projectService.searchProjects(currentUser.getId(), query);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/upcoming-deadlines")
    @Operation(
            summary = "Get projects with upcoming deadlines",
            description = "Retrieves projects with deadlines in the next N days",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Projects retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "Unauthorized")
            }
    )
    public ResponseEntity<List<ProjectResponse>> getUpcomingDeadlines(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Number of days ahead to check")
            @RequestParam(defaultValue = "7") int days) {
        log.debug("GET /api/projects/upcoming-deadlines - userId={} days={}", currentUser.getId(), days);
        List<ProjectResponse> projects = projectService.getUpcomingDeadlines(currentUser.getId(), days);
        return ResponseEntity.ok(projects);
    }
}
