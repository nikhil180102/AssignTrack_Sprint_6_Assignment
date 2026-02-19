package com.notification.dto;

import com.notification.entity.NotificationChannel;
import com.notification.entity.NotificationRole;
import com.notification.entity.NotificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private Long userId;
    private NotificationRole role;
    private NotificationChannel channel;
    private NotificationStatus status;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
}
