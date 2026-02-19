package com.notification.service;

import com.notification.dto.NotificationEvent;
import com.notification.dto.SendNotificationRequest;
import com.notification.entity.NotificationChannel;
import com.notification.entity.NotificationRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;

    @KafkaListener(topics = "${notification.kafka.topic}", groupId = "notification-service")
    public void handle(NotificationEvent event) {
        try {
            SendNotificationRequest request = new SendNotificationRequest();
            request.setUserId(event.getUserId());
            request.setEmail(event.getEmail());
            request.setRole(NotificationRole.valueOf(event.getRole()));
            request.setChannel(NotificationChannel.valueOf(event.getChannel()));
            request.setTitle(event.getTitle());
            request.setMessage(event.getMessage());

            notificationService.sendNotification(request);
        } catch (Exception ex) {
            log.error("Failed to handle notification event: {}", ex.getMessage(), ex);
        }
    }
}
