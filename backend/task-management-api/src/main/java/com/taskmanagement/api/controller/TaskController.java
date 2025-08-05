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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class TaskController {
    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getTasks(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) TaskPriority priority,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) String search) {

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

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskResponse> getTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID taskId) {
        TaskResponse task = taskService.getTask(currentUser.getId(), taskId);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody TaskCreateRequest request) {
        TaskResponse task = taskService.createTask(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID taskId,
            @Valid @RequestBody TaskUpdateRequest request) {
        TaskResponse task = taskService.updateTask(currentUser.getId(), taskId, request);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<MessageResponse> deleteTask(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable UUID taskId) {
        taskService.deleteTask(currentUser.getId(), taskId);
        return ResponseEntity.ok(new MessageResponse("Task deleted successfully"));
    }
}
