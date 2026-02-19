package com.notification.service;

import com.notification.dto.NotificationResponse;
import com.notification.dto.SendNotificationRequest;
import com.notification.entity.Notification;
import com.notification.entity.NotificationChannel;
import com.notification.entity.NotificationRole;
import com.notification.entity.NotificationStatus;
import com.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private EmailService emailService;
    @Mock private ModelMapper modelMapper;

    @InjectMocks
    private NotificationService notificationService;

    private SendNotificationRequest inAppRequest;
    private SendNotificationRequest emailRequest;

    @BeforeEach
    void setUp() {
        inAppRequest = new SendNotificationRequest();
        inAppRequest.setUserId(1L);
        inAppRequest.setRole(NotificationRole.STUDENT);
        inAppRequest.setChannel(NotificationChannel.IN_APP);
        inAppRequest.setTitle("Welcome");
        inAppRequest.setMessage("Hello");

        emailRequest = new SendNotificationRequest();
        emailRequest.setUserId(2L);
        emailRequest.setEmail("student@example.com");
        emailRequest.setRole(NotificationRole.STUDENT);
        emailRequest.setChannel(NotificationChannel.EMAIL);
        emailRequest.setTitle("OTP");
        emailRequest.setMessage("123456");
    }

    @Test
    void sendNotification_inApp_success() {
        Notification saved = Notification.builder()
                .id(10L)
                .userId(1L)
                .channel(NotificationChannel.IN_APP)
                .status(NotificationStatus.SENT)
                .build();
        NotificationResponse response = NotificationResponse.builder().id(10L).build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);
        when(modelMapper.map(any(Notification.class), eq(NotificationResponse.class))).thenReturn(response);

        NotificationResponse result = notificationService.sendNotification(inAppRequest);

        assertEquals(10L, result.getId());
        verify(notificationRepository, times(2)).save(any(Notification.class));
    }

    @Test
    void sendNotification_email_success_marksSent() {
        Notification pending = Notification.builder()
                .id(20L)
                .userId(2L)
                .channel(NotificationChannel.EMAIL)
                .status(NotificationStatus.PENDING)
                .build();
        Notification sent = Notification.builder()
                .id(20L)
                .userId(2L)
                .channel(NotificationChannel.EMAIL)
                .status(NotificationStatus.SENT)
                .build();
        NotificationResponse response = NotificationResponse.builder().id(20L).status(NotificationStatus.SENT).build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(pending, sent);
        when(modelMapper.map(any(Notification.class), eq(NotificationResponse.class))).thenReturn(response);

        NotificationResponse result = notificationService.sendNotification(emailRequest);

        assertEquals(NotificationStatus.SENT, result.getStatus());
        verify(emailService).send("student@example.com", "OTP", "123456");
    }

    @Test
    void sendNotification_email_failure_marksFailed() {
        Notification pending = Notification.builder()
                .id(21L)
                .userId(2L)
                .channel(NotificationChannel.EMAIL)
                .status(NotificationStatus.PENDING)
                .build();
        Notification failed = Notification.builder()
                .id(21L)
                .userId(2L)
                .channel(NotificationChannel.EMAIL)
                .status(NotificationStatus.FAILED)
                .build();
        NotificationResponse response = NotificationResponse.builder().id(21L).status(NotificationStatus.FAILED).build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(pending, failed);
        doThrow(new RuntimeException("smtp down")).when(emailService).send(any(), any(), any());
        when(modelMapper.map(any(Notification.class), eq(NotificationResponse.class))).thenReturn(response);

        NotificationResponse result = notificationService.sendNotification(emailRequest);

        assertEquals(NotificationStatus.FAILED, result.getStatus());
    }

    @Test
    void markRead_notFound_throwsRuntime() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> notificationService.markRead(99L));
    }
}
