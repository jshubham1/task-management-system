package com.taskmanagement.api.service;

import com.taskmanagement.api.dto.request.ProjectCreateRequest;
import com.taskmanagement.api.dto.request.ProjectUpdateRequest;
import com.taskmanagement.api.dto.response.ProjectResponse;
import com.taskmanagement.api.dto.response.ProjectSummaryResponse;
import com.taskmanagement.api.entity.Project;
import com.taskmanagement.api.entity.User;
import com.taskmanagement.api.exception.ProjectNotFoundException;
import com.taskmanagement.api.exception.UserNotFoundException;
import com.taskmanagement.api.exception.ValidationException;
import com.taskmanagement.api.repository.ProjectRepository;
import com.taskmanagement.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectResponse> getProjectsByUser(UUID userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return projects.stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProject(UUID userId, UUID projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found"));

        return ProjectResponse.fromEntity(project);
    }

    public ProjectResponse createProject(UUID userId, ProjectCreateRequest request) {
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Check if project name already exists for this user
        if (projectRepository.existsByNameAndUserId(request.getName(), userId)) {
            throw new ValidationException("Project name already exists");
        }

        // Create project
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor() != null ? request.getColor() : "#2196F3")
                .deadline(request.getDeadline())
                .user(user)
                .build();

        Project savedProject = projectRepository.save(project);
        return ProjectResponse.fromEntity(savedProject);
    }

    public ProjectResponse updateProject(UUID userId, UUID projectId, ProjectUpdateRequest request) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found"));

        // Check if new name conflicts with existing projects (excluding current)
        if (!project.getName().equals(request.getName()) &&
                projectRepository.existsByNameAndUserIdAndIdNot(request.getName(), userId, projectId)) {
            throw new ValidationException("Project name already exists");
        }

        // Update project fields
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setColor(request.getColor());
        project.setDeadline(request.getDeadline());

        Project updatedProject = projectRepository.save(project);
        return ProjectResponse.fromEntity(updatedProject);
    }

    public void deleteProject(UUID userId, UUID projectId) {
        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ProjectNotFoundException("Project not found"));

        // Note: This will also delete associated tasks due to cascade settings
        // You might want to implement soft delete or move tasks to "No Project"
        projectRepository.delete(project);
    }

    public List<ProjectSummaryResponse> getProjectSummaries(UUID userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return projects.stream()
                .map(project -> {
                    Long totalTasks = projectRepository.countTasksByProjectId(project.getId());
                    Long completedTasks = projectRepository.countCompletedTasksByProjectId(project.getId());

                    return ProjectSummaryResponse.builder()
                            .id(project.getId())
                            .name(project.getName())
                            .color(project.getColor())
                            .totalTasks(totalTasks != null ? totalTasks.intValue() : 0)
                            .completedTasks(completedTasks != null ? completedTasks.intValue() : 0)
                            .progress(totalTasks > 0 ? (completedTasks * 100.0) / totalTasks : 0.0)
                            .deadline(project.getDeadline())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> searchProjects(UUID userId, String searchTerm) {
        List<Project> projects = projectRepository.findByUserIdAndSearch(userId, searchTerm);
        return projects.stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getUpcomingDeadlines(UUID userId, int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime future = now.plusDays(days);

        List<Project> projects = projectRepository.findByUserIdAndDeadlineBetween(userId, now, future);
        return projects.stream()
                .map(ProjectResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
