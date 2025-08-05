package com.taskmanagement.api.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
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
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Email
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String firstName;

    @Column(nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false)
    private String password;

    private String profilePicture;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean emailVerified = false;

    private String emailVerificationToken;
    private LocalDateTime emailVerificationTokenExpiry;

    private String passwordResetToken;
    private LocalDateTime passwordResetTokenExpiry;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List
            <Task> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserSession> sessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    // Helper methods
    @Transient
    public String getFullName() {
        return firstName + " " + lastName;
    }

    @Transient
    public String getInitials() {
        return (firstName != null ? firstName.substring(0, 1) : "") +
                (lastName != null ? lastName.substring(0, 1) : "");
    }

    @Transient
    public boolean isEmailVerificationTokenValid() {
        return emailVerificationToken != null &&
                emailVerificationTokenExpiry != null &&
                LocalDateTime.now().isBefore(emailVerificationTokenExpiry);
    }

    @Transient
    public boolean isPasswordResetTokenValid() {
        return passwordResetToken != null &&
                passwordResetTokenExpiry != null &&
                LocalDateTime.now().isBefore(passwordResetTokenExpiry);
    }

    // Update last login
    public void updateLastLogin() {
        this.lastLoginAt = LocalDateTime.now();
    }
}
