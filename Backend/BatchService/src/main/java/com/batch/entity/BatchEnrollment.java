package com.batch.entity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "batch_enrollments",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"batch_id", "student_id"})
        }
)
@Data
public class BatchEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId; // user_id from UserService

    @ManyToOne(optional = false)
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    @PrePersist
    void onEnroll() {
        enrolledAt = LocalDateTime.now();
    }
}
