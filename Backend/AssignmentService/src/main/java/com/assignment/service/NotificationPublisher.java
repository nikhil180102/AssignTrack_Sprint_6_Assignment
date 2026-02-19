package com.assignment.service;

import com.assignment.dto.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    @Value("${notification.kafka.topic}")
    private String topic;

    public void publish(NotificationEvent event) {
        try {
            kafkaTemplate.send(topic, event.getUserId() != null ? event.getUserId().toString() : null, event);
        } catch (Exception ex) {
            log.error("Failed to publish notification event: {}", ex.getMessage(), ex);
        }
    }
}
