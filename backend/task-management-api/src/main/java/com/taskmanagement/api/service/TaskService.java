package com.taskmanagement.api.service;

import com.taskmanagement.api.dto.request.TaskCreateRequest;
import com.taskmanagement.api.dto.request.TaskFilterRequest;
import com.taskmanagement.api.dto.request.TaskUpdateRequest;
import com.taskmanagement.api.dto.response.TaskResponse;
import com.taskmanagement.api.entity.Project;
import com.taskmanagement.api.entity.Task;
import com.taskmanagement.api.entity.User;
import com.taskmanagement.api.enums.TaskStatus;
import com.taskmanagement.api.exception.ProjectNotFoundException;
import com.taskmanagement.api.exception.TaskNotFoundException;
import com.taskmanagement.api.exception.UnauthorizedAccessException;
import com.taskmanagement.api.exception.UserNotFoundException;
import com.taskmanagement.api.repository.ProjectRepository;
import com.taskmanagement.api.repository.TaskRepository;
import com.taskmanagement.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public Page<TaskResponse> getTasks(UUID userId, TaskFilterRequest filter) {
        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.by(Sort.Direction.fromString(filter.getSortDirection()), filter.getSortBy())
        );

        Page<Task> tasks;

        if (filter.getSearch() != null && !filter.getSearch().isEmpty()) {
            tasks = taskRepository.findByUserIdAndSearchAndIsDeletedFalse(userId, filter.getSearch(), pageable);
        } else if (filter.getStatus() != null) {
            tasks = taskRepository.findByUserIdAndStatusAndIsDeletedFalse(userId, filter.getStatus(), pageable);
        } else if (filter.getProjectId() != null) {
            tasks = taskRepository.findByUserIdAndProjectIdAndIsDeletedFalse(userId, filter.getProjectId(), pageable);
        } else {
            tasks = taskRepository.findByUserIdAndIsDeletedFalse(userId, pageable);
        }

        return tasks.map(TaskResponse::fromEntity);
    }

    public TaskResponse createTask(UUID userId, TaskCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        Task.TaskBuilder taskBuilder = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .dueDate(request.getDueDate())
                .user(user);

        if (request.getProjectId() != null) {
            Project project = projectRepository.findByIdAndUserId(request.getProjectId(), userId)
                    .orElseThrow(() -> new ProjectNotFoundException("Project not found"));
            taskBuilder.project(project);
        }

        Task task = taskRepository.save(taskBuilder.build());
        return TaskResponse.fromEntity(task);
    }

    public TaskResponse updateTask(UUID userId, UUID taskId, TaskUpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));

        // Verify ownership
        if (!task.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have permission to update this task");
        }

        // Update fields
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        // Handle status change
        if (request.getStatus() != task.getStatus()) {
            task.setStatus(request.getStatus());
            if (request.getStatus() == TaskStatus.DONE) {
                task.setCompletedAt(LocalDateTime.now());
            } else {
                task.setCompletedAt(null);
            }
        }

        Task updatedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(updatedTask);
    }

    public void deleteTask(UUID userId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));

        if (!task.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("You don't have permission to delete this task");
        }

        // Soft delete
        task.setIsDeleted(true);
        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    public TaskResponse getTask(UUID id, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found"));
        return TaskResponse.fromEntity(task);
    }
}
