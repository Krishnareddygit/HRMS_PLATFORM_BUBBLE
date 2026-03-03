package com.example.notifications.repository;

import com.example.notifications.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findTop50ByTargetRoleInOrderByCreatedAtDesc(Collection<String> targetRoles);
}
