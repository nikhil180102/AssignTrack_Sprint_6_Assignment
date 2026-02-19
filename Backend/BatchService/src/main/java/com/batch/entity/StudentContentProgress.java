package com.batch.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_content_progress",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "content_id"})
)
@Data
public class StudentContentProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "content_id", nullable = false)
    private BatchContent content;

    @Column(nullable = false)
    private boolean completed = true;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    void onCreate() {
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }
}

