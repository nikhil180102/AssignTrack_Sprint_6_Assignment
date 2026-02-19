package com.user.service;

import com.user.dto.NotificationEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.kafka.core.KafkaTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class NotificationPublisherTest {

    @Mock
    private KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @InjectMocks
    private NotificationPublisher notificationPublisher;

    @BeforeEach
    void setUp() throws Exception {
        java.lang.reflect.Field field =
                NotificationPublisher.class.getDeclaredField("topic");
        field.setAccessible(true);
        field.set(notificationPublisher, "test-topic");
    }

    @Test
    void publish_success() {
        NotificationEvent event = new NotificationEvent(
                1L,
                "test@example.com",
                "STUDENT",
                "EMAIL",
                "Test Subject",
                "Test Message"
        );

        when(kafkaTemplate.send(anyString(), any(), any()))
                .thenReturn(null);

        boolean result = notificationPublisher.publish(event);

        assertTrue(result);
        verify(kafkaTemplate)
                .send(eq("test-topic"), eq("1"), eq(event));
    }

    @Test
    void publish_withNullUserId_shouldSendNullKey() {
        NotificationEvent event = new NotificationEvent(
                null,
                "test@example.com",
                "STUDENT",
                "EMAIL",
                "Test Subject",
                "Test Message"
        );

        boolean result = notificationPublisher.publish(event);

        assertTrue(result);
        verify(kafkaTemplate)
                .send(eq("test-topic"), isNull(), eq(event));
    }

    @Test
    void publish_shouldReturnFalseWhenExceptionOccurs() {
        NotificationEvent event = new NotificationEvent(
                1L,
                "test@example.com",
                "STUDENT",
                "EMAIL",
                "Test Subject",
                "Test Message"
        );

        doThrow(new RuntimeException("Kafka down"))
                .when(kafkaTemplate)
                .send(anyString(), any(), any());

        boolean result = notificationPublisher.publish(event);

        assertFalse(result);
    }
}
