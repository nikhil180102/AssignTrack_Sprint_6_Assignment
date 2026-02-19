package com.assignment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"assignment_id", "studentId"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;
    @Column(nullable = false)
    private Long studentId;
    @Column(length = 5000)
    private String submissionContent;
    private String filePath;

    private Integer obtainedMarks;

    private String feedback;

    private LocalDateTime submittedAt;

    private LocalDateTime evaluatedAt;
}
