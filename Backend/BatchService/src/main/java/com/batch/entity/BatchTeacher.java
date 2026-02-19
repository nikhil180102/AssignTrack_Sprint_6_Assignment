package com.batch.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "batch_teachers",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"batch_id", "teacher_id"})
        }
)
@Data
public class BatchTeacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "teacher_id", nullable = false)
    private Long teacherId; // from UserService

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    void onCreate() {
        assignedAt = LocalDateTime.now();
    }
}

