package com.taskmanagement.api.repository;

import com.taskmanagement.api.entity.Task;
import com.taskmanagement.api.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

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
}
