package com.taskmanagement.api.repository;

import com.taskmanagement.api.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    // Find projects by user
    List<Project> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Find project by ID and user (for security)
    Optional<Project> findByIdAndUserId(UUID id, UUID userId);

    // Find projects by user with deadline approaching
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.deadline BETWEEN :startDate AND :endDate ORDER BY p.deadline ASC")
    List<Project> findByUserIdAndDeadlineBetween(@Param("userId") UUID userId,
                                                 @Param("startDate") LocalDateTime startDate,
                                                 @Param("endDate") LocalDateTime endDate);

    // Count projects by user
    Long countByUserId(UUID userId);

    // Find projects with overdue deadlines
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND p.deadline < :currentDate ORDER BY p.deadline ASC")
    List<Project> findOverdueProjectsByUserId(@Param("userId") UUID userId,
                                              @Param("currentDate") LocalDateTime currentDate);

    // Search projects by name or description
    @Query("SELECT p FROM Project p WHERE p.user.id = :userId AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "ORDER BY p.createdAt DESC")
    List<Project> findByUserIdAndSearch(@Param("userId") UUID userId,
                                        @Param("search") String search);

    // Check if project name exists for user
    Boolean existsByNameAndUserId(String name, UUID userId);

    // Check if project name exists for user excluding current project
    Boolean existsByNameAndUserIdAndIdNot(String name, UUID userId, UUID projectId);

    // Get project statistics
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.isDeleted = false")
    Long countTasksByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'DONE' AND t.isDeleted = false")
    Long countCompletedTasksByProjectId(@Param("projectId") UUID projectId);
}
