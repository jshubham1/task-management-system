package com.taskmanagement.api.repository;

import com.taskmanagement.api.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByRefreshTokenAndUserId(String refreshToken, UUID userId);

    List<UserSession> findByUserIdAndIsActiveTrue(UUID userId);

    List<UserSession> findByUserIdAndExpiresAtBefore(UUID userId, LocalDateTime date);

    void deleteByExpiresAtBefore(LocalDateTime date);

    void deleteByUserId(UUID userId);
}
