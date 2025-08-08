package com.taskmanagement.api.service;

import com.taskmanagement.api.dto.request.ProjectCreateRequest;
import com.taskmanagement.api.dto.request.ProjectUpdateRequest;
import com.taskmanagement.api.dto.response.ProjectResponse;
import com.taskmanagement.api.dto.response.ProjectSummaryResponse;
import com.taskmanagement.api.entity.Project;
import com.taskmanagement.api.entity.User;
import com.taskmanagement.api.enums.TaskStatus;
import com.taskmanagement.api.exception.ProjectNotFoundException;
import com.taskmanagement.api.exception.UserNotFoundException;
import com.taskmanagement.api.exception.ValidationException;
import com.taskmanagement.api.repository.ProjectRepository;
import com.taskmanagement.api.repository.TaskRepository;
import com.taskmanagement.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByUser(UUID userId) {
        log.debug("Fetching projects for user: {}", userId);

        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);

        log.debug("Found {} projects for user: {}", projects.size(), userId);

        return projects.stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID userId, UUID projectId) {
        log.debug("Fetching project: {} for user: {}", projectId, userId);

        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found or access denied"));

        return ProjectResponse.fromEntity(project);
    }

    public ProjectResponse createProject(UUID userId, ProjectCreateRequest request) {
        log.info("Creating new project '{}' for user: {}", request.getName(), userId);

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if project name already exists for this user
        if (projectRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new ValidationException("Project with name '" + request.getName() + "' already exists");
        }

        // Validate deadline is not in the past
        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Project deadline cannot be in the past");
        }

        // Create project
        Project project = Project.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .color(request.getColor() != null ? request.getColor() : "#2196F3")
                .deadline(request.getDeadline())
                .user(user)
                .build();

        Project savedProject = projectRepository.save(project);
        log.info("Successfully created project with ID: {} for user: {}", savedProject.getId(), userId);

        return ProjectResponse.fromEntity(savedProject);
    }

    public ProjectResponse updateProject(UUID userId, UUID projectId, ProjectUpdateRequest request) {
        log.info("Updating project: {} for user: {}", projectId, userId);

        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found or access denied"));

        // Check if new name conflicts with existing projects (excluding current)
        if (!project.getName().equals(request.getName().trim()) &&
                projectRepository.existsByNameAndUserIdAndIdNot(request.getName().trim(), userId, projectId)) {
            throw new ValidationException("Project with name '" + request.getName() + "' already exists");
        }

        // Validate deadline is not in the past
        if (request.getDeadline() != null && request.getDeadline().isBefore(LocalDateTime.now())) {
            throw new ValidationException("Project deadline cannot be in the past");
        }

        // Update project fields
        project.setName(request.getName().trim());
        project.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        project.setColor(request.getColor());
        project.setDeadline(request.getDeadline());

        Project updatedProject = projectRepository.save(project);
        log.info("Successfully updated project: {} for user: {}", projectId, userId);

        return ProjectResponse.fromEntity(updatedProject);
    }

    public void deleteProject(UUID userId, UUID projectId) {
        log.info("Deleting project: {} for user: {}", projectId, userId);

        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found or access denied"));

        // Check if project has tasks
        Long taskCount = taskRepository.countByProjectIdAndIsDeletedFalse(projectId);
        if (taskCount > 0) {
            log.warn("Attempting to delete project {} with {} active tasks", projectId, taskCount);
            // Option 1: Prevent deletion
            // throw new ValidationException("Cannot delete project with active tasks. Please delete or reassign tasks first.");

            // Option 2: Soft delete tasks or move to "No Project"
            taskRepository.softDeleteByProjectId(projectId);
            log.info("Soft deleted {} tasks associated with project: {}", taskCount, projectId);
        }

        projectRepository.delete(project);
        log.info("Successfully deleted project: {} for user: {}", projectId, userId);
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryResponse> getProjectSummaries(UUID userId) {
        log.debug("Fetching project summaries for user: {}", userId);

        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return projects.stream()
                .map(project -> {
                    Long totalTasks = taskRepository.countByProjectIdAndIsDeletedFalse(project.getId());
                    Long completedTasks = taskRepository.countByProjectIdAndStatusAndIsDeletedFalse(
                            project.getId(), TaskStatus.DONE);
                    Long overdueTasks = taskRepository.countOverdueTasksByProjectId(
                            project.getId(), LocalDateTime.now());

                    return ProjectSummaryResponse.builder()
                            .id(project.getId())
                            .name(project.getName())
                            .color(project.getColor())
                            .totalTasks(totalTasks != null ? totalTasks.intValue() : 0)
                            .completedTasks(completedTasks != null ? completedTasks.intValue() : 0)
                            // .overdueTasks(overdueTasks != null ? overdueTasks.intValue() : 0)
                            .progress(totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0)
                            .deadline(project.getDeadline())
                            .isOverdue(project.getDeadline() != null &&
                                    LocalDateTime.now().isAfter(project.getDeadline()))
                            //.createdAt(project.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> searchProjects(UUID userId, String searchTerm) {
        log.debug("Searching projects for user: {} with term: {}", userId, searchTerm);

        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getProjectsByUser(userId);
        }

        List<Project> projects = projectRepository.findByUserIdAndSearch(userId, searchTerm.trim());

        return projects.stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUpcomingDeadlines(UUID userId, int days) {
        log.debug("Fetching projects with deadlines in next {} days for user: {}", days, userId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusDays(days);

        List<Project> projects = projectRepository.findByUserIdAndDeadlineBetween(userId, now, future);

        return projects.stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
