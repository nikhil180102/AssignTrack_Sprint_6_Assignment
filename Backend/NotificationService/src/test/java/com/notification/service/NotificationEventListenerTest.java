package com.notification.service;

import com.notification.dto.NotificationEvent;
import com.notification.dto.SendNotificationRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationEventListenerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationEventListener notificationEventListener;

    @Test
    void handle_validEvent_callsService() {
        NotificationEvent event = new NotificationEvent(
                1L,
                "student@example.com",
                "STUDENT",
                "IN_APP",
                "Title",
                "Message"
        );

        notificationEventListener.handle(event);

        ArgumentCaptor<SendNotificationRequest> captor = ArgumentCaptor.forClass(SendNotificationRequest.class);
        verify(notificationService, times(1)).sendNotification(captor.capture());
        assertEquals(1L, captor.getValue().getUserId());
        assertEquals("Title", captor.getValue().getTitle());
    }

    @Test
    void handle_invalidRole_doesNotThrow() {
        NotificationEvent event = new NotificationEvent(
                1L,
                "student@example.com",
                "INVALID_ROLE",
                "IN_APP",
                "Title",
                "Message"
        );

        notificationEventListener.handle(event);

        verify(notificationService, times(0)).sendNotification(any());
    }

    @Test
    void handle_serviceThrows_doesNotPropagate() {
        NotificationEvent event = new NotificationEvent(
                1L,
                "student@example.com",
                "STUDENT",
                "IN_APP",
                "Title",
                "Message"
        );

        doThrow(new RuntimeException("db issue"))
                .when(notificationService).sendNotification(any(SendNotificationRequest.class));

        notificationEventListener.handle(event);

        verify(notificationService, times(1)).sendNotification(any(SendNotificationRequest.class));
    }
}

