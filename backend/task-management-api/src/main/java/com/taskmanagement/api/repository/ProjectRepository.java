package com.taskmanagement.api.repository;

import com.taskmanagement.api.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

    // Add these methods to your existing ProjectRepository interface

    @Query("SELECT COUNT(p) FROM Project p WHERE p.user.id = :userId AND EXISTS (SELECT 1 FROM Task t WHERE t.project = p AND t.isDeleted = false)")
    Long countActiveProjectsByUserId(@Param("userId") UUID userId);

    Long countByUserIdAndDeadlineIsNotNull(UUID userId);

    Long countByUserIdAndDeadlineBefore(UUID userId, LocalDateTime date);

    Long countByUserIdAndDeadlineBetween(UUID userId, LocalDateTime startDate, LocalDateTime endDate);

    // Completed projects (all tasks done)
    @Query("""
            SELECT COUNT(DISTINCT p) FROM Project p 
            WHERE p.user.id = :userId 
                AND EXISTS (SELECT 1 FROM Task t WHERE t.project = p AND t.isDeleted = false)
                AND NOT EXISTS (SELECT 1 FROM Task t WHERE t.project = p AND t.status != 'DONE' AND t.isDeleted = false)
            """)
    Long countCompletedProjectsByUserId(@Param("userId") UUID userId);

    // Average completion rate
    @Query("""
            SELECT AVG(
                CASE 
                    WHEN total_tasks.task_count = 0 THEN 0
                    ELSE (completed_tasks.completed_count * 100.0 / total_tasks.task_count)
                END
            ) as average_completion_rate
            FROM (
                SELECT p.id as project_id, COUNT(t) as task_count
                FROM Project p
                LEFT JOIN Task t ON t.project = p AND t.isDeleted = false
                WHERE p.user.id = :userId
                GROUP BY p.id
            ) total_tasks
            JOIN (
                SELECT p.id as project_id, COUNT(t) as completed_count
                FROM Project p
                LEFT JOIN Task t ON t.project = p AND t.status = 'DONE' AND t.isDeleted = false
                WHERE p.user.id = :userId
                GROUP BY p.id
            ) completed_tasks ON total_tasks.project_id = completed_tasks.project_id
            """)
    Double getAverageCompletionRateByUserId(@Param("userId") UUID userId);

    // Detailed project progress stats
    @Query("""
            SELECT 
                p.id,
                p.name,
                p.color,
                COUNT(t),
                SUM(CASE WHEN t.status = 'DONE' THEN 1 ELSE 0 END),
                p.deadline
            FROM Project p
            LEFT JOIN Task t ON t.project = p AND t.isDeleted = false
            WHERE p.user.id = :userId
            GROUP BY p.id, p.name, p.color, p.deadline
            ORDER BY p.createdAt DESC
            """)
    List<Object[]> getProjectProgressStatsByUserId(@Param("userId") UUID userId);

    // Projects created by month
    @Query(value = """
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month,
                COUNT(*) as count
            FROM projects 
            WHERE user_id = :userId::uuid 
                AND created_at >= (NOW() - (:months::text || ' months')::interval)
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month DESC
            """, nativeQuery = true)
    List<Object[]> getProjectsCreatedByMonthRaw(@Param("userId") UUID userId, @Param("months") int months);

    default Map<String, Integer> getProjectsCreatedByMonth(UUID userId, int months) {
        List<Object[]> rawData = getProjectsCreatedByMonthRaw(userId, months);
        return rawData.stream()
                .collect(Collectors.toMap(
                        data -> (String) data[0],
                        data -> ((Number) data[1]).intValue(),
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
                ));
    }

    // Recent project activities
    @Query(value = """
            SELECT 
                p.id as project_id,
                p.name as project_name,
                'PROJECT_UPDATED' as activity_type,
                p.updated_at as timestamp
            FROM projects p
            WHERE p.user_id = :userId 
                AND p.updated_at >= :since
                AND p.updated_at != p.created_at
                
            UNION ALL
                
            SELECT 
                p.id as project_id,
                p.name as project_name,
                'PROJECT_CREATED' as activity_type,
                p.created_at as timestamp
            FROM projects p
            WHERE p.user_id = :userId 
                AND p.created_at >= :since
                
            ORDER BY timestamp DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getRecentProjectActivitiesRaw(@Param("userId") UUID userId,
                                                 @Param("since") LocalDateTime since,
                                                 @Param("limit") int limit);

    default List<Object[]> getRecentProjectActivities(UUID userId, int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(30); // Last 30 days
        return getRecentProjectActivitiesRaw(userId, since, limit);
    }

}
