package com.assignment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mcq_submissions",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"mcq_assignment_id", "student_id"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class McqSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mcq_assignment_id", nullable = false)
    private McqAssignment mcqAssignment;

    @Column(nullable = false, name = "student_id")
    private Long studentId;
    @Column(nullable = false, columnDefinition = "JSON")
    private String answersJson;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private Integer obtainedMarks;

    @Column(nullable = false)
    private Double percentage;

    @Column(nullable = false)
    private Boolean passed;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    private Integer timeTaken; // in seconds
}