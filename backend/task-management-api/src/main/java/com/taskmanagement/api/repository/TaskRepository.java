package com.taskmanagement.api.repository;

import com.taskmanagement.api.dto.response.DailyTaskStats;
import com.taskmanagement.api.entity.Task;
import com.taskmanagement.api.enums.TaskPriority;
import com.taskmanagement.api.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    Page<Task> findByUserIdAndIsDeletedFalse(UUID userId, Pageable pageable);

    Page<Task> findByUserIdAndStatusAndIsDeletedFalse(UUID userId, TaskStatus status, Pageable pageable);

    Page<Task> findByUserIdAndProjectIdAndIsDeletedFalse(UUID userId, UUID projectId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.user.id = :userId AND t.isDeleted = false AND " +
            "(LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findByUserIdAndSearchAndIsDeletedFalse(@Param("userId") UUID userId,
                                                      @Param("search") String search,
                                                      Pageable pageable);

    Long countByUserIdAndStatus(UUID userId, TaskStatus status);

    Long countByUserIdAndDueDateBeforeAndStatusNot(UUID userId, LocalDateTime date, TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.isDeleted = false")
    Long countByProjectIdAndIsDeletedFalse(@Param("projectId") UUID projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = :status AND t.isDeleted = false")
    Long countByProjectIdAndStatusAndIsDeletedFalse(@Param("projectId") UUID projectId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.dueDate < :currentDate AND t.status != 'DONE' AND t.isDeleted = false")
    Long countOverdueTasksByProjectId(@Param("projectId") UUID projectId, @Param("currentDate") LocalDateTime currentDate);

    @Modifying
    @Query("UPDATE Task t SET t.isDeleted = true, t.deletedAt = CURRENT_TIMESTAMP WHERE t.project.id = :projectId AND t.isDeleted = false")
    void softDeleteByProjectId(@Param("projectId") UUID projectId);

    // Basic counts for dashboard summary
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.isDeleted = false")
    Long countByUserIdAndIsDeletedFalse(@Param("userId") UUID userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status = :status AND t.isDeleted = false")
    Long countByUserIdAndStatusAndIsDeletedFalse(@Param("userId") UUID userId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.status != :status AND t.isDeleted = false")
    Long countByUserIdAndStatusNotAndIsDeletedFalse(@Param("userId") UUID userId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.dueDate < :currentDate AND t.status != :status AND t.isDeleted = false")
    Long countByUserIdAndDueDateBeforeAndStatusNotAndIsDeletedFalse(@Param("userId") UUID userId,
                                                                    @Param("currentDate") LocalDateTime currentDate,
                                                                    @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND DATE(t.dueDate) = DATE(:today) AND t.status != 'DONE' AND t.isDeleted = false")
    Long countTasksDueToday(@Param("userId") UUID userId, @Param("today") LocalDateTime today);

    // Task statistics for dashboard
    @Query("SELECT COUNT(t) FROM Task t WHERE t.user.id = :userId AND t.priority = :priority AND t.isDeleted = false")
    Long countByUserIdAndPriorityAndIsDeletedFalse(@Param("userId") UUID userId, @Param("priority") TaskPriority priority);

    // Daily task completion stats
    @Query(value = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as created,
                COALESCE(SUM(CASE WHEN status = 'DONE' THEN 1 ELSE 0 END), 0) as completed,
                COUNT(*) as total_active
            FROM tasks 
            WHERE user_id = :userId 
                AND is_deleted = false 
                AND created_at >= :startDate 
            GROUP BY DATE(created_at) 
            ORDER BY date DESC
            """, nativeQuery = true)
    List<Object[]> getDailyTaskCompletionStatsRaw(@Param("userId") UUID userId, @Param("startDate") LocalDateTime startDate);

    default List<DailyTaskStats> getDailyTaskCompletionStats(UUID userId, LocalDateTime startDate) {
        List<Object[]> rawData = getDailyTaskCompletionStatsRaw(userId, startDate);
        return rawData.stream()
                .map(data -> DailyTaskStats.builder()
                        .date(((java.sql.Date) data[0]).toLocalDate())
                        .created(((Number) data[1]).intValue())
                        .completed(((Number) data[2]).intValue())
                        .totalActive(((Number) data[3]).intValue())
                        .build())
                .collect(Collectors.toList());
    }

    // Recent task activities for activity feed
    @Query(value = """
            SELECT 
                t.id as task_id,
                t.title as task_title,
                'TASK_UPDATED' as activity_type,
                t.updated_at as timestamp,
                NULL as old_value,
                t.status as new_value
            FROM tasks t
            WHERE t.user_id = :userId 
                AND t.is_deleted = false 
                AND t.updated_at >= :since
                
            UNION ALL
                
            SELECT 
                t.id as task_id,
                t.title as task_title,
                'TASK_COMPLETED' as activity_type,
                t.completed_at as timestamp,
                NULL as old_value,
                'DONE' as new_value
            FROM tasks t
            WHERE t.user_id = :userId 
                AND t.status = 'DONE' 
                AND t.completed_at IS NOT NULL
                AND t.completed_at >= :since
                AND t.is_deleted = false
                
            UNION ALL
                
            SELECT 
                t.id as task_id,
                t.title as task_title,
                'TASK_CREATED' as activity_type,
                t.created_at as timestamp,
                NULL as old_value,
                NULL as new_value
            FROM tasks t
            WHERE t.user_id = :userId 
                AND t.created_at >= :since
                AND t.is_deleted = false
                
            ORDER BY timestamp DESC
            LIMIT :limit
            """, nativeQuery = true)
    List<Object[]> getRecentTaskActivitiesRaw(@Param("userId") UUID userId,
                                              @Param("since") LocalDateTime since,
                                              @Param("limit") int limit);

    default List<Object[]> getRecentTaskActivities(UUID userId, int limit) {
        LocalDateTime since = LocalDateTime.now().minusDays(30); // Last 30 days
        return getRecentTaskActivitiesRaw(userId, since, limit);
    }


}
