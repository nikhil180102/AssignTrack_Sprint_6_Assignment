package com.batch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "batches")
@Data
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String batchCode;   // JAVA, SPRING-BOOT, KAFKA

    @Column(nullable = false)
    private String name;        // Java, Spring Boot, Kafka

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchStatus status; // DRAFT / PUBLISHED / CLOSED

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

