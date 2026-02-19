package com.notification.repository;

import com.notification.entity.Notification;
import com.notification.entity.NotificationRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByRoleOrderByCreatedAtDesc(NotificationRole role);
    void deleteByUserId(Long userId);
}
