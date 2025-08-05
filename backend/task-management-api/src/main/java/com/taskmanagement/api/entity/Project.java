package com.taskmanagement.api.entity;

import com.taskmanagement.api.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 500)
    private String description;

    @Builder.Default
    @Column(length = 7)
    private String color = "#2196F3";

    private LocalDateTime deadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();

    // Calculated fields for convenience
    @Transient
    public int getTaskCount() {
        return tasks != null ? tasks.size() : 0;
    }

    @Transient
    public int getCompletedTaskCount() {
        if (tasks == null) return 0;
        return (int) tasks.stream()
                .filter(task -> !task.getIsDeleted())
                .filter(task -> task.getStatus() == TaskStatus.DONE)
                .count();
    }

    @Transient
    public double getProgress() {
        int totalTasks = getTaskCount();
        if (totalTasks == 0) return 0.0;
        return (getCompletedTaskCount() * 100.0) / totalTasks;
    }
}
