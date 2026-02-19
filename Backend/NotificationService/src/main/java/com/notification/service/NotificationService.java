package com.notification.service;

import com.notification.dto.NotificationResponse;
import com.notification.dto.SendNotificationRequest;
import com.notification.entity.Notification;
import com.notification.entity.NotificationChannel;
import com.notification.entity.NotificationRole;
import com.notification.entity.NotificationStatus;
import com.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final ModelMapper modelMapper;

    @Transactional
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .role(request.getRole())
                .channel(request.getChannel())
                .status(NotificationStatus.PENDING)
                .title(request.getTitle())
                .message(request.getMessage())
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        if (request.getChannel() == NotificationChannel.EMAIL) {
            try {
                emailService.send(request.getEmail(), request.getTitle(), request.getMessage());
                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
            } catch (Exception ex) {
                log.error("Failed to send email to {}: {}", request.getEmail(), ex.getMessage(), ex);
                notification.setStatus(NotificationStatus.FAILED);
            }
            notification = notificationRepository.save(notification);
        } else {
            notification.setStatus(NotificationStatus.SENT);
            notification = notificationRepository.save(notification);
        }

        return mapToResponse(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getForRole(NotificationRole role) {
        return notificationRepository.findByRoleOrderByCreatedAtDesc(role)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public NotificationResponse markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification = notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    @Transactional
    public void clearForUser(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }

    @Transactional
    public void deleteById(Long id) {
        notificationRepository.deleteById(id);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return modelMapper.map(notification, NotificationResponse.class);
    }
}
