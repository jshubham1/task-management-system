package com.taskmanagement.api.controller;

import com.taskmanagement.api.dto.request.TaskCreateRequest;
import com.taskmanagement.api.dto.request.TaskFilterRequest;
import com.taskmanagement.api.dto.request.TaskUpdateRequest;
import com.taskmanagement.api.dto.response.MessageResponse;
import com.taskmanagement.api.dto.response.TaskResponse;
import com.taskmanagement.api.enums.TaskPriority;
import com.taskmanagement.api.enums.TaskStatus;
import com.taskmanagement.api.security.UserPrincipal;
import com.taskmanagement.api.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@Slf4j
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {
    private final TaskService taskService;

    @Operation(
            summary = "List tasks",
            description = "Retrieve paginated tasks for the authenticated user with optional filters"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction: asc|desc") @RequestParam(defaultValue = "desc") String sortDirection,
            @Parameter(description = "Filter by task status") @RequestParam(required = false) TaskStatus status,
            @Parameter(description = "Filter by task priority") @RequestParam(required = false) TaskPriority priority,
            @Parameter(description = "Filter by project ID") @RequestParam(required = false) UUID projectId,
            @Parameter(description = "Search text in title/description") @RequestParam(required = false) String search) {

        log.debug("GET /api/tasks - userId={} page={} size={} sortBy={} sortDirection={} status={} priority={} projectId={} search={}",
                currentUser.getId(), page, size, sortBy, sortDirection, status, priority, projectId, search);

        TaskFilterRequest filter = TaskFilterRequest.builder()
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .status(status)
                .priority(priority)
                .projectId(projectId)
                .search(search)
                .build();

        Page<TaskResponse> tasks = taskService.getTasks(currentUser.getId(), filter);
        return ResponseEntity.ok(tasks);
    }

    @Operation(summary = "Get task by ID", description = "Retrieve a single task by its ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Task ID") @PathVariable UUID taskId) {
        log.debug("GET /api/tasks/{} - userId={}", taskId, currentUser.getId());
        TaskResponse task = taskService.getTask(currentUser.getId(), taskId);
        return ResponseEntity.ok(task);
    }

    @Operation(summary = "Create task", description = "Create a new task for the authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Task created successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TaskCreateRequest request) {
        log.info("POST /api/tasks - userId={} title={} priority={} projectId={}",
                currentUser.getId(), request.getTitle(), request.getPriority(), request.getProjectId());
        TaskResponse task = taskService.createTask(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @Operation(summary = "Update task", description = "Update an existing task by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "404", description = "Task not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Valid @RequestBody TaskUpdateRequest request) {
        log.info("PUT /api/tasks/{} - userId={} status={} priority={} dueDate={}",
                taskId, currentUser.getId(), request.getStatus(), request.getPriority(), request.getDueDate());
        TaskResponse task = taskService.updateTask(currentUser.getId(), taskId, request);
        return ResponseEntity.ok(task);
    }

    @Operation(summary = "Delete task", description = "Delete a task by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Task not found"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @DeleteMapping("/{taskId}")
    public ResponseEntity<MessageResponse> deleteTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Parameter(description = "Task ID") @PathVariable UUID taskId) {
        log.info("DELETE /api/tasks/{} - userId={}", taskId, currentUser.getId());
        taskService.deleteTask(currentUser.getId(), taskId);
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }
}
